import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Neon PostgreSQL with Pakistan AgriSupply dataset...");

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.syncQueue.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.ioTSensor.deleteMany();
  await prisma.coldStorage.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.geofence.deleteMany();
  await prisma.gPSLocation.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.qualityInspection.deleteMany();
  await prisma.produceBatch.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  console.log("Cleared old database records");

  const tenant1 = await prisma.tenant.create({
    data: {
      name: "PakAgri Cold-Chain Logistics Ltd.",
      type: "ENTERPRISE",
      location: "M-2 Motorway Logistics Corridor, Lahore, Pakistan",
      contactEmail: "operations@pakagri-coldlogistics.pk",
      contactPhone: "+92-42-35889901",
    },
  });

  await prisma.tenant.create({
    data: {
      name: "Punjab Citrus and Mango Growers Syndicate",
      type: "AGRI_PRODUCER",
      location: "Bhalwal Road, Sargodha, Punjab, Pakistan",
      contactEmail: "info@punjabgrowers.pk",
      contactPhone: "+92-48-3721045",
    },
  });

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      name: "Malik Farooq Ahmad",
      email: "admin@demo.com",
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
      phone: "+92-300-8451122",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      status: "ACTIVE",
    },
  });

  const farmerUser = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      name: "Chaudhry Tariq Mehmood",
      email: "farmer@demo.com",
      passwordHash: hashedPassword,
      role: "FARMER",
      phone: "+92-321-4567890",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
      status: "ACTIVE",
    },
  });

  const transporterUser = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      name: "Asif Mahmood NLC",
      email: "transporter@demo.com",
      passwordHash: hashedPassword,
      role: "TRANSPORTER",
      phone: "+92-333-5566778",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
      status: "ACTIVE",
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      name: "Haji Bashir Gujjar",
      email: "warehouse@demo.com",
      passwordHash: hashedPassword,
      role: "WAREHOUSE_ADMIN",
      phone: "+92-312-9988776",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
      status: "ACTIVE",
    },
  });

  const retailerUser = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      name: "Zubair Qureshi Imtiaz Retail",
      email: "retailer@demo.com",
      passwordHash: hashedPassword,
      role: "RETAILER",
      phone: "+92-345-2233445",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      status: "ACTIVE",
    },
  });

  console.log("Created Pakistan Users");

  const farmKinnow = await prisma.farm.create({
    data: {
      tenantId: tenant1.id,
      farmerId: farmerUser.id,
      farmName: "Bhalwal Export Citrus Orchards",
      location: "Bhalwal, Sargodha District, Punjab",
      latitude: 32.268,
      longitude: 72.9,
      totalArea: 450.0,
      cropTypes: "Kinnow Mandarin, Citrus reticulata, Sweet Orange",
      status: "ACTIVE",
    },
  });

  const farmMango = await prisma.farm.create({
    data: {
      tenantId: tenant1.id,
      farmerId: farmerUser.id,
      farmName: "Al-Raheem Royal Chaunsa Groves",
      location: "Shujabad Tehsil, Multan, Punjab",
      latitude: 30.1575,
      longitude: 71.45,
      totalArea: 320.0,
      cropTypes: "White Chaunsa Mango, Sindhri Mango, Anwar Ratol",
      status: "ACTIVE",
    },
  });

  const farmPotato = await prisma.farm.create({
    data: {
      tenantId: tenant1.id,
      farmerId: farmerUser.id,
      farmName: "Okara Agrico Certified Potato Fields",
      location: "Depalpur Road, Okara, Punjab",
      latitude: 30.8081,
      longitude: 73.4458,
      totalArea: 600.0,
      cropTypes: "Seed Potatoes Mozika, Lady Rosetta, Diamond",
      status: "ACTIVE",
    },
  });

  const farmSwat = await prisma.farm.create({
    data: {
      tenantId: tenant1.id,
      farmerId: farmerUser.id,
      farmName: "Swat Alpine Valley Fruit Orchards",
      location: "Madyan Valley, Swat, Khyber Pakhtunkhwa",
      latitude: 35.2227,
      longitude: 72.4258,
      totalArea: 180.0,
      cropTypes: "Royal Red Cherries, Golden Delicious Apples, Peaches",
      status: "ACTIVE",
    },
  });

  console.log("Created Pakistan Farms");

  const batchKinnow = await prisma.produceBatch.create({
    data: {
      tenantId: tenant1.id,
      farmId: farmKinnow.id,
      batchNumber: "BAT-PK-KINNOW-01",
      produceType: "Kinnow Mandarin",
      variety: "Export Seedless Select",
      quantity: 25000.0,
      unit: "kg",
      harvestDate: new Date("2026-09-27T06:00:00Z"),
      expectedShelfLife: 49,
      currentStage: "IN_TRANSIT",
      qualityStatus: "APPROVED",
    },
  });

  const batchMango = await prisma.produceBatch.create({
    data: {
      tenantId: tenant1.id,
      farmId: farmMango.id,
      batchNumber: "BAT-PK-CHAUNSA-02",
      produceType: "White Chaunsa Mango",
      variety: "Export Grade Honey A+",
      quantity: 14000.0,
      unit: "kg",
      harvestDate: new Date("2026-09-28T05:30:00Z"),
      expectedShelfLife: 20,
      currentStage: "IN_TRANSIT",
      qualityStatus: "APPROVED",
    },
  });

  const batchPotato = await prisma.produceBatch.create({
    data: {
      tenantId: tenant1.id,
      farmId: farmPotato.id,
      batchNumber: "BAT-PK-POTATO-03",
      produceType: "Seed Potatoes",
      variety: "Mozika Certified Seed",
      quantity: 48000.0,
      unit: "kg",
      harvestDate: new Date("2026-09-26T07:00:00Z"),
      expectedShelfLife: 155,
      currentStage: "COLD_STORAGE",
      qualityStatus: "APPROVED",
    },
  });

  const batchCherry = await prisma.produceBatch.create({
    data: {
      tenantId: tenant1.id,
      farmId: farmSwat.id,
      batchNumber: "BAT-PK-CHERRY-04",
      produceType: "Royal Red Cherries",
      variety: "Swat Alpine Heirloom",
      quantity: 4500.0,
      unit: "kg",
      harvestDate: new Date("2026-09-29T06:15:00Z"),
      expectedShelfLife: 15,
      currentStage: "QUALITY_CHECK",
      qualityStatus: "PENDING",
    },
  });

  const batchRice = await prisma.produceBatch.create({
    data: {
      tenantId: tenant1.id,
      farmId: farmPotato.id,
      batchNumber: "BAT-PK-RICE-05",
      produceType: "Basmati Rice",
      variety: "1121 Super Kernel Basmati",
      quantity: 120000.0,
      unit: "kg",
      harvestDate: new Date("2026-09-20T07:00:00Z"),
      expectedShelfLife: 365,
      currentStage: "DISTRIBUTION",
      qualityStatus: "APPROVED",
    },
  });

  console.log("Created Pakistan Produce Batches");

  await prisma.qualityInspection.create({
    data: {
      batchId: batchKinnow.id,
      inspectorId: adminUser.id,
      inspectionDate: new Date("2026-09-27T09:30:00Z"),
      grade: "Grade A",
      temperature: 4.2,
      humidity: 88.0,
      moisture: 12.4,
      appearance: "Excellent",
      contamination: false,
      status: "APPROVED",
      notes: "Brix 12.4 exceeds export criteria. Zero citrus canker. Wax coating applied. GlobalGAP compliant.",
    },
  });

  await prisma.qualityInspection.create({
    data: {
      batchId: batchMango.id,
      inspectorId: adminUser.id,
      inspectionDate: new Date("2026-09-28T08:00:00Z"),
      grade: "Grade A",
      temperature: 11.2,
      humidity: 85.0,
      moisture: 18.5,
      appearance: "Excellent",
      contamination: false,
      status: "APPROVED",
      notes: "Hot Water Treatment 48C for 60 min completed. Pulp sweetness 18.5 Brix. Approved for Dubai export.",
    },
  });

  await prisma.qualityInspection.create({
    data: {
      batchId: batchPotato.id,
      inspectorId: adminUser.id,
      inspectionDate: new Date("2026-09-26T10:00:00Z"),
      grade: "Grade A",
      temperature: 3.5,
      humidity: 92.0,
      moisture: 80.0,
      appearance: "Good",
      contamination: false,
      status: "APPROVED",
      notes: "FSC and RD certified seed lot. Zero late blight detected. Suitable for cold store at 3-4C.",
    },
  });

  await prisma.qualityInspection.create({
    data: {
      batchId: batchCherry.id,
      inspectorId: adminUser.id,
      inspectionDate: new Date("2026-09-29T07:00:00Z"),
      grade: "Grade B",
      temperature: 1.5,
      humidity: 89.0,
      moisture: 82.0,
      appearance: "Good",
      contamination: false,
      status: "CONDITIONAL",
      notes: "Minor surface bruising on 2.3% of batch. Approved for domestic retail only. Priority cold chain required.",
    },
  });

  const warehouseLahore = await prisma.warehouse.create({
    data: {
      tenantId: tenant1.id,
      name: "Lahore Central Cold-Chain Hub",
      location: "M-2 Interchange, Multan Road, Thokar Niaz Baig, Lahore",
      latitude: 31.4697,
      longitude: 74.2728,
      capacity: 250.0,
      currentCapacity: 142.0,
      status: "OPERATIONAL",
    },
  });

  const warehouseMultan = await prisma.warehouse.create({
    data: {
      tenantId: tenant1.id,
      name: "Multan Southern Chilled Logistics Hub",
      location: "Industrial Estate Phase II, Shershah Road, Multan",
      latitude: 30.1984,
      longitude: 71.4687,
      capacity: 180.0,
      currentCapacity: 94.0,
      status: "OPERATIONAL",
    },
  });

  const warehouseKarachi = await prisma.warehouse.create({
    data: {
      tenantId: tenant1.id,
      name: "Port Qasim Marine Export Cold Terminal",
      location: "Reefer Berth 4, Port Muhammad Bin Qasim, Karachi",
      latitude: 24.7833,
      longitude: 67.35,
      capacity: 350.0,
      currentCapacity: 198.0,
      status: "OPERATIONAL",
    },
  });

  console.log("Created Warehouses");

  const chamber1 = await prisma.coldStorage.create({
    data: {
      warehouseId: warehouseLahore.id,
      name: "Chamber LHR-A1 Citrus and Fresh Fruit Zone",
      temperatureMin: 3.0,
      temperatureMax: 6.0,
      humidityMin: 85.0,
      humidityMax: 92.0,
      status: "ACTIVE",
    },
  });

  const chamber2 = await prisma.coldStorage.create({
    data: {
      warehouseId: warehouseLahore.id,
      name: "Chamber LHR-B2 Deep Potato Preservation",
      temperatureMin: 2.5,
      temperatureMax: 4.5,
      humidityMin: 88.0,
      humidityMax: 95.0,
      status: "ACTIVE",
    },
  });

  const chamber3 = await prisma.coldStorage.create({
    data: {
      warehouseId: warehouseMultan.id,
      name: "Chamber MUX-M1 Mango Pre-Cooling and Chilled Staging",
      temperatureMin: 9.5,
      temperatureMax: 12.5,
      humidityMin: 82.0,
      humidityMax: 88.0,
      status: "ACTIVE",
    },
  });

  const chamber4 = await prisma.coldStorage.create({
    data: {
      warehouseId: warehouseKarachi.id,
      name: "Chamber KHI-E1 Export Pre-Cooling Terminal",
      temperatureMin: 4.0,
      temperatureMax: 8.0,
      humidityMin: 80.0,
      humidityMax: 90.0,
      status: "ACTIVE",
    },
  });

  const sensor1 = await prisma.ioTSensor.create({
    data: {
      coldStorageId: chamber1.id,
      sensorCode: "SNS-PK-LHR-01",
      sensorType: "TEMPERATURE_HUMIDITY",
      status: "ONLINE",
      lastReading: new Date(),
    },
  });

  const sensor2 = await prisma.ioTSensor.create({
    data: {
      coldStorageId: chamber2.id,
      sensorCode: "SNS-PK-LHR-02",
      sensorType: "TEMPERATURE_HUMIDITY",
      status: "ONLINE",
      lastReading: new Date(),
    },
  });

  const sensor3 = await prisma.ioTSensor.create({
    data: {
      coldStorageId: chamber3.id,
      sensorCode: "SNS-PK-MUX-03",
      sensorType: "TEMPERATURE_HUMIDITY",
      status: "ONLINE",
      lastReading: new Date(),
    },
  });

  await prisma.ioTSensor.create({
    data: {
      coldStorageId: chamber4.id,
      sensorCode: "SNS-PK-KHI-04",
      sensorType: "TEMPERATURE_HUMIDITY",
      status: "ONLINE",
      lastReading: new Date(),
    },
  });

  await prisma.ioTSensor.create({
    data: {
      coldStorageId: chamber2.id,
      sensorCode: "SNS-PK-LHR-05",
      sensorType: "ETHYLENE",
      status: "ONLINE",
      lastReading: new Date(),
    },
  });

  for (let i = 12; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * 3600000);
    await prisma.sensorReading.create({
      data: {
        sensorId: sensor1.id,
        temperature: Number((4.1 + Math.sin(i) * 0.4).toFixed(1)),
        humidity: Number((87.5 + Math.cos(i) * 1.5).toFixed(1)),
        timestamp,
        isAlert: false,
      },
    });
    await prisma.sensorReading.create({
      data: {
        sensorId: sensor3.id,
        temperature: Number((11.2 + Math.sin(i * 0.8) * 0.5).toFixed(1)),
        humidity: Number((84.5 + Math.cos(i) * 1.2).toFixed(1)),
        timestamp,
        isAlert: false,
      },
    });
    const tempAlert = i === 3;
    await prisma.sensorReading.create({
      data: {
        sensorId: sensor2.id,
        temperature: Number((tempAlert ? 5.8 : 3.2 + Math.sin(i * 0.5) * 0.3).toFixed(1)),
        humidity: Number((91.0 + Math.sin(i) * 1.0).toFixed(1)),
        timestamp,
        isAlert: tempAlert,
        alertReason: tempAlert ? "Temperature exceeded 4.5C threshold defrost cycle" : null,
      },
    });
  }

  console.log("Created IoT Sensors and Readings");

  const vehicle1 = await prisma.vehicle.create({
    data: {
      tenantId: tenant1.id,
      vehicleNumber: "LES-8842",
      type: "Refrigerated Truck (10T)",
      capacity: 28000.0,
      refrigerationEnabled: true,
      status: "IN_TRANSIT",
      currentLatitude: 31.854,
      currentLongitude: 73.321,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      tenantId: tenant1.id,
      vehicleNumber: "KHI-9921",
      type: "Trailer (24T)",
      capacity: 35000.0,
      refrigerationEnabled: true,
      status: "IN_TRANSIT",
      currentLatitude: 27.558,
      currentLongitude: 68.789,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      tenantId: tenant1.id,
      vehicleNumber: "MN-4412",
      type: "Van (2T)",
      capacity: 8500.0,
      refrigerationEnabled: true,
      status: "AVAILABLE",
      currentLatitude: 30.1984,
      currentLongitude: 71.4687,
    },
  });

  await prisma.vehicle.create({
    data: {
      tenantId: tenant1.id,
      vehicleNumber: "ISL-3311",
      type: "Refrigerated Truck (10T)",
      capacity: 10000.0,
      refrigerationEnabled: true,
      status: "MAINTENANCE",
      currentLatitude: 33.7294,
      currentLongitude: 73.0931,
    },
  });

  const driver1 = await prisma.driver.create({
    data: {
      tenantId: tenant1.id,
      name: "Asif Mahmood NLC Lead Pilot",
      licenseNumber: "LHR-HTV-889412",
      phone: "+92-300-8899112",
      status: "ON_DUTY",
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      tenantId: tenant1.id,
      name: "Rashid Ali Baloch",
      licenseNumber: "KHI-HTV-441029",
      phone: "+92-333-7766554",
      status: "ON_DUTY",
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      tenantId: tenant1.id,
      name: "Muhammad Nawaz Bhatti",
      licenseNumber: "MUL-HTV-228834",
      phone: "+92-302-6655443",
      status: "AVAILABLE",
    },
  });

  await prisma.geofence.create({ data: { tenantId: tenant1.id, name: "Lahore M-2 Terminal Logistics Perimeter", type: "WAREHOUSE", latitude: 31.4697, longitude: 74.2728, radius: 2500.0, status: "ACTIVE" } });
  await prisma.geofence.create({ data: { tenantId: tenant1.id, name: "Multan M-5 Motorway Reefer Depot", type: "WAREHOUSE", latitude: 30.1984, longitude: 71.4687, radius: 2000.0, status: "ACTIVE" } });
  await prisma.geofence.create({ data: { tenantId: tenant1.id, name: "Bhalwal Citrus Packing Pre-Cooling Gate", type: "FARM", latitude: 32.268, longitude: 72.9, radius: 1800.0, status: "ACTIVE" } });
  await prisma.geofence.create({ data: { tenantId: tenant1.id, name: "Port Qasim Marine Export Geofence Zone", type: "WAREHOUSE", latitude: 24.7833, longitude: 67.35, radius: 3000.0, status: "ACTIVE" } });
  await prisma.geofence.create({ data: { tenantId: tenant1.id, name: "Okara Potato Farm Collection Point", type: "FARM", latitude: 30.8081, longitude: 73.4458, radius: 1200.0, status: "ACTIVE" } });

  console.log("Created Geofences");

  const shipment1 = await prisma.shipment.create({
    data: {
      tenantId: tenant1.id,
      batchId: batchKinnow.id,
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      shipmentNumber: "SHP-PK-2026-101",
      source: "Bhalwal Citrus Packing Terminal, Sargodha",
      sourceLat: 32.268,
      sourceLng: 72.9,
      destination: "Lahore Central Cold-Chain Hub, Thokar Niaz Baig",
      destinationLat: 31.4697,
      destinationLng: 74.2728,
      status: "IN_TRANSIT",
      quantity: 25000.0,
      expectedDelivery: new Date("2026-09-29T14:30:00Z"),
    },
  });

  const shipment2 = await prisma.shipment.create({
    data: {
      tenantId: tenant1.id,
      batchId: batchMango.id,
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      shipmentNumber: "SHP-PK-2026-102",
      source: "Al-Raheem Chaunsa Orchards, Shujabad, Multan",
      sourceLat: 30.1575,
      sourceLng: 71.45,
      destination: "Port Qasim Marine Export Terminal Berth 4, Karachi",
      destinationLat: 24.7833,
      destinationLng: 67.35,
      status: "IN_TRANSIT",
      quantity: 14000.0,
      expectedDelivery: new Date("2026-09-29T22:00:00Z"),
    },
  });

  const shipment3 = await prisma.shipment.create({
    data: {
      tenantId: tenant1.id,
      batchId: batchRice.id,
      vehicleId: vehicle3.id,
      driverId: driver3.id,
      shipmentNumber: "SHP-PK-2026-103",
      source: "Okara Agrico Collection Hub",
      sourceLat: 30.8081,
      sourceLng: 73.4458,
      destination: "Lahore Central Cold-Chain Hub",
      destinationLat: 31.4697,
      destinationLng: 74.2728,
      status: "DELIVERED",
      quantity: 50000.0,
      expectedDelivery: new Date("2026-09-28T18:00:00Z"),
      actualDelivery: new Date("2026-09-28T17:45:00Z"),
      receiverName: "Haji Bashir Gujjar",
    },
  });

  const gpsPoints1 = [
    { lat: 32.268, lng: 72.9, speed: 0 },
    { lat: 32.12, lng: 73.05, speed: 68 },
    { lat: 31.96, lng: 73.2, speed: 75 },
    { lat: 31.854, lng: 73.321, speed: 74 },
  ];
  for (let j = 0; j < gpsPoints1.length; j++) {
    const pt = gpsPoints1[j];
    await prisma.gPSLocation.create({
      data: { shipmentId: shipment1.id, vehicleId: vehicle1.id, latitude: pt.lat, longitude: pt.lng, speed: pt.speed, timestamp: new Date(Date.now() - j * 900000) },
    });
  }

  const gpsPoints2 = [
    { lat: 30.1575, lng: 71.45, speed: 0 },
    { lat: 29.37, lng: 70.34, speed: 80 },
    { lat: 28.42, lng: 69.21, speed: 78 },
    { lat: 27.558, lng: 68.789, speed: 78 },
  ];
  for (let j = 0; j < gpsPoints2.length; j++) {
    const pt = gpsPoints2[j];
    await prisma.gPSLocation.create({
      data: { shipmentId: shipment2.id, vehicleId: vehicle2.id, latitude: pt.lat, longitude: pt.lng, speed: pt.speed, timestamp: new Date(Date.now() - j * 1800000) },
    });
  }

  await prisma.gPSLocation.create({
    data: { vehicleId: vehicle3.id, latitude: 30.1984, longitude: 71.4687, speed: 0, timestamp: new Date() },
  });

  console.log("Created GPS Track Points");

  const order1 = await prisma.order.create({
    data: {
      tenantId: tenant1.id,
      retailerId: retailerUser.id,
      orderNumber: "ORD-PK-2026-0081",
      totalAmount: 2850000.0,
      subtotal: 2850000.0,
      tax: 0.0,
      status: "DISPATCHED",
      shippingAddress: "Imtiaz Mega Store Distribution Center, Ring Road, Lahore",
      deliveryDate: new Date("2026-09-30T12:00:00Z"),
    },
  });

  await prisma.orderItem.create({
    data: { orderId: order1.id, produceBatchId: batchKinnow.id, quantity: 15000.0, unitPrice: 190.0, subtotal: 2850000.0 },
  });

  await prisma.invoice.create({
    data: { tenantId: tenant1.id, orderId: order1.id, invoiceNumber: "INV-PK-2026-0081", subtotal: 2850000.0, tax: 0.0, total: 2850000.0, status: "PAID", dueDate: new Date("2026-10-15T00:00:00Z") },
  });

  await prisma.transaction.create({
    data: { tenantId: tenant1.id, type: "SALE", referenceId: order1.id, amount: 2850000.0, currency: "PKR", status: "COMPLETED", paymentMethod: "BANK_TRANSFER" },
  });

  const order2 = await prisma.order.create({
    data: {
      tenantId: tenant1.id,
      retailerId: retailerUser.id,
      orderNumber: "ORD-PK-2026-0082",
      totalAmount: 4200000.0,
      subtotal: 4200000.0,
      tax: 0.0,
      status: "CONFIRMED",
      shippingAddress: "Metro Cash and Carry Pakistan Central Depot, Airport Road, Karachi",
      deliveryDate: new Date("2026-10-01T15:00:00Z"),
    },
  });

  await prisma.orderItem.create({
    data: { orderId: order2.id, produceBatchId: batchMango.id, quantity: 12000.0, unitPrice: 350.0, subtotal: 4200000.0 },
  });

  await prisma.invoice.create({
    data: { tenantId: tenant1.id, orderId: order2.id, invoiceNumber: "INV-PK-2026-0082", subtotal: 4200000.0, tax: 0.0, total: 4200000.0, status: "ISSUED", dueDate: new Date("2026-10-20T00:00:00Z") },
  });

  const order3 = await prisma.order.create({
    data: {
      tenantId: tenant1.id,
      retailerId: retailerUser.id,
      orderNumber: "ORD-PK-2026-0083",
      totalAmount: 7680000.0,
      subtotal: 7680000.0,
      tax: 0.0,
      status: "PENDING",
      shippingAddress: "Utility Stores Corporation Bulk Depot, Rawalpindi",
      deliveryDate: new Date("2026-10-05T10:00:00Z"),
    },
  });

  await prisma.orderItem.create({
    data: { orderId: order3.id, produceBatchId: batchRice.id, quantity: 96000.0, unitPrice: 80.0, subtotal: 7680000.0 },
  });

  console.log("Created B2B Orders in PKR");

  const notifs = [
    { type: "SHIPMENT", title: "Kinnow Reefer LES-8842 Departed Sargodha", message: "Vehicle LES-8842 with 25000 kg Kinnow has entered M-2 Southbound. Core temp +4.2C.", priority: "INFO", read: false },
    { type: "TEMPERATURE", title: "Cold Storage LHR-B2 Temperature Alert Resolved", message: "Potato chamber returned to +3.2C after defrost cycle. 92% RH maintained.", priority: "WARNING", read: false },
    { type: "IOT", title: "Sensor SNS-PK-LHR-01 Healthy", message: "Citrus zone: +4.1C / 87.5% RH. Battery 97%.", priority: "SUCCESS", read: true },
    { type: "SHIPMENT", title: "Mango Export SHP-PK-2026-102 Entering Sindh", message: "KHI-9921 with 14000 kg Chaunsa crossed Sukkur Bypass. ETA Port Qasim: 4 hours.", priority: "INFO", read: false },
    { type: "ORDER", title: "Order ORD-PK-2026-0081 Paid and Dispatched", message: "Rs 2850000 payment confirmed via bank transfer. Kinnow dispatched to Imtiaz Lahore.", priority: "SUCCESS", read: true },
    { type: "QUALITY", title: "Cherry Batch BAT-PK-CHERRY-04 Conditional Approval", message: "Minor surface bruising 2.3%. Approved for domestic retail only.", priority: "WARNING", read: false },
    { type: "GEOFENCE", title: "Vehicle LES-8842 Approaching Lahore Hub", message: "LES-8842 entered 25km radius. Dock 3 pre-cooled and ready.", priority: "INFO", read: false },
  ];

  for (const n of notifs) {
    await prisma.notification.create({
      data: { tenantId: tenant1.id, userId: adminUser.id, type: n.type, title: n.title, message: n.message, priority: n.priority, read: n.read },
    });
  }

  await prisma.auditLog.create({ data: { tenantId: tenant1.id, userId: adminUser.id, action: "BATCH_REGISTRATION", entity: "BATCH", details: JSON.stringify({ batch: "BAT-PK-KINNOW-01", qty: 25000 }), ipAddress: "182.180.124.15" } });
  await prisma.auditLog.create({ data: { tenantId: tenant1.id, userId: adminUser.id, action: "QUALITY_INSPECTION", entity: "BATCH", details: JSON.stringify({ grade: "Grade A", batch: "BAT-PK-CHAUNSA-02" }), ipAddress: "182.180.124.15" } });
  await prisma.auditLog.create({ data: { tenantId: tenant1.id, userId: adminUser.id, action: "STATUS_CHANGE", entity: "SHIPMENT", details: JSON.stringify({ shipment: "SHP-PK-2026-101", from: "PLANNED", to: "IN_TRANSIT" }), ipAddress: "182.180.124.15" } });
  await prisma.auditLog.create({ data: { tenantId: tenant1.id, userId: adminUser.id, action: "TEMP_BREACH", entity: "SENSOR", details: JSON.stringify({ sensor: "SNS-PK-LHR-02", temp: 5.8, threshold: 4.5, resolved: true }), ipAddress: "10.0.1.45" } });
  await prisma.auditLog.create({ data: { tenantId: tenant1.id, userId: retailerUser.id, action: "ORDER_CREATED", entity: "ORDER", details: JSON.stringify({ order: "ORD-PK-2026-0081", amount: 2850000, currency: "PKR" }), ipAddress: "39.35.240.122" } });

  console.log("Seeding complete!");
  console.log("Demo Credentials:");
  console.log("  admin@demo.com / Password123!");
  console.log("  farmer@demo.com / Password123!");
  console.log("  transporter@demo.com / Password123!");
  console.log("  warehouse@demo.com / Password123!");
  console.log("  retailer@demo.com / Password123!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
