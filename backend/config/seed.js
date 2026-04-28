const Personnel = require("../models/Personnel");

const defaultPersonnel = [
  { name: "Capt. Arjun Verma",    role: "Security",    status: "Available", zone: "Main Lobby",        contact: "+91-9800001111" },
  { name: "Dr. Priya Sharma",     role: "Medical",     status: "Available", zone: "Medical Bay A",     contact: "+91-9800002222" },
  { name: "Unit Bravo-3",         role: "Fire",        status: "Available", zone: "Fire Station East", contact: "+91-9800003333" },
  { name: "Insp. Rohit Singh",    role: "Police",      status: "Available", zone: "Gate Security",     contact: "+91-9800004444" },
  { name: "Tech. Meena Joshi",    role: "Maintenance", status: "Available", zone: "Control Room",      contact: "+91-9800005555" },
  { name: "Team Alpha-Evac",      role: "Evacuation",  status: "Available", zone: "Block A",           contact: "+91-9800006666" },
  { name: "Manager Suresh Patel", role: "Manager",     status: "Available", zone: "Executive Floor",   contact: "+91-9800007777" },
  { name: "Nurse Anjali Das",     role: "Medical",     status: "Available", zone: "Medical Bay B",     contact: "+91-9800008888" },
];

const seedPersonnel = async () => {
  try {
    const existing = await Personnel.find({});
    if (existing.length === 0) {
      for (const p of defaultPersonnel) await Personnel.create(p);
      console.log("✅ Demo personnel seeded (8 units)");
    }
  } catch (e) {
    console.error("Seed error:", e.message);
  }
};

module.exports = seedPersonnel;
