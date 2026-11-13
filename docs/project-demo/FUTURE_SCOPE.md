# YTC Campus Navigator - Future Scope & Research Roadmap
**Institution:** Yashoda Technical Campus (YTC), Satara, Maharashtra, India  
**Department:** Artificial Intelligence & Data Science Engineering  

---

## 1. Augmented Reality (AR) Campus Wayfinding

### Vision:
Overlay animated 3D directional arrows directly onto a student's real-time smartphone camera feed using **WebXR** and **Three.js**.
- **Outdoor AR:** Visual cues guiding students across the campus lawn towards department buildings.
- **Indoor AR:** Floating corridor markers pointing towards Room 202, eliminating the cognitive load of reading 2D architectural blueprints.

---

## 2. Live Indoor Blue-Dot Tracking (BLE Beacons & WiFi RTT)

### Implementation Roadmap:
- **Bluetooth Low Energy (BLE) iBeacons:** Deploy cost-effective battery-powered BLE beacons at corridor intersections and stairwells.
- **Trilateration Algorithm:** By measuring Received Signal Strength Indication (RSSI) from three nearby beacons and applying a Kalman filter to smooth signal noise, calculate real-time indoor $(X, Y)$ position within $1.5\text{ meters}$.
- **Doorway QR Anchors:** Printable QR code placards placed at building doorways allowing instantaneous 1-second recalibration of user position.

---

## 3. Academic Timetable & Student ERP Integration

### Capabilities:
- Connect YTC Campus Navigator to the college ERP / Timetable Management System.
- When an AI & DS student logs into the student portal, their upcoming lecture or practical batch appears on their dashboard:
  > *"Next: Machine Learning Lab (11:15 AM) • Room 202 • Engineering Block"*
- Tapping **"Take Me to Class"** automatically sets the student's current location as the starting point and plots the shortest path.

---

## 4. Emergency Evacuation & Dynamic Hazard Avoidance

### Features:
- In the event of a fire drill or emergency, campus security activates **Evacuation Mode** from the Admin Dashboard.
- The routing algorithm dynamically inverts edge weights to direct occupants away from affected wings towards the nearest safe fire exits and assembly grounds.

---

## 5. Multilingual Voice Guidance (Marathi, Hindi, English)

### Inclusivity:
- Speech synthesis and speech-to-text allowing rural visitors and parents to speak queries in **Marathi** (e.g. *"फार्मसी विभाग कुठे आहे?"* - Where is the Pharmacy department?).
- Voice-assisted turn-by-turn navigation guiding visitors in their native regional language.

---

## 6. Smart IoT Campus Parking Availability

### Integration:
- Install ultrasonic sensors or computer vision cameras at YTC parking lots (Two-Wheeler / Four-Wheeler zones).
- Real-time vacant slot counters displayed directly on the campus map, guiding drivers to open bays.
