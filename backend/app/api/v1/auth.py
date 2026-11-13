from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.campus import User, ActivityLog
from app.schemas.campus import (
    UserLogin,
    TokenResponse,
    UserResponse,
    UserCreateRequest,
    UserUpdateRequest
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    get_admin_user,
    get_superadmin_user
)

router = APIRouter(prefix="/auth", tags=["Authentication & Administration"])

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticates campus members or administrators and returns a signed JWT access token."""
    email_clean = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact campus administrator."
        )

    # Validate password using salted PBKDF2 hash or demo fallback
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Use demonstration credentials: admin@ytc.edu.in / admin123"
        )

    # Generate JWT token with sub=email and role
    token = create_access_token(data={
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
        "name": user.full_name
    })

    # Log login activity
    log = ActivityLog(
        user_email=user.email,
        action="login",
        entity_type="user",
        entity_id=str(user.id),
        summary=f"User {user.full_name} ({user.email}) signed in with role '{user.role}'."
    )
    db.add(log)
    db.commit()

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile for currently authenticated user."""
    return current_user

# ============================
# USER MANAGEMENT (RBAC)
# ============================
@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """Retrieves all registered system and campus accounts (Admin access required)."""
    return db.query(User).order_by(User.id.asc()).all()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_superadmin_user)
):
    """Creates a new administrative or departmental account (Super Admin only)."""
    clean_email = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{clean_email}' already exists."
        )

    hashed = get_password_hash(payload.password)
    new_user = User(
        email=clean_email,
        full_name=payload.full_name.strip(),
        hashed_password=hashed,
        role=payload.role.lower(),
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Audit log
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="create",
        entity_type="user",
        entity_id=str(new_user.id),
        summary=f"Created new user '{new_user.full_name}' ({new_user.email}) with role '{new_user.role}'."
    ))
    db.commit()

    return new_user

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_superadmin_user)
):
    """Updates user roles, active status, or resets password (Super Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User ID {user_id} not found."
        )

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.role is not None:
        user.role = payload.role.lower()
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.password:
        user.hashed_password = get_password_hash(payload.password)

    db.add(ActivityLog(
        user_email=current_admin.email,
        action="update",
        entity_type="user",
        entity_id=str(user.id),
        summary=f"Updated profile/permissions for user '{user.email}'."
    ))
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_superadmin_user)
):
    """Deactivates a user account (Super Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User ID {user_id} not found."
        )

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own administrative account."
        )

    user.is_active = False
    db.add(ActivityLog(
        user_email=current_admin.email,
        action="delete",
        entity_type="user",
        entity_id=str(user.id),
        summary=f"Deactivated user account '{user.email}'."
    ))
    db.commit()
    return {"success": True, "message": f"User '{user.email}' has been deactivated."}
