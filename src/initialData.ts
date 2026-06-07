import { Customer, Device, RepairTicket, SparePart, Delivery, Invoice, Inquiry, SystemLog, Technician, ReceiptUpload } from "./types";

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 4, full_name: "Girma Hailu", email: "girma.hailu@ethionet.et", phone: "0911556677", address: "Gerji, Addis Ababa", alt_phone: "+251911223399", active: true },
  { id: 5, full_name: "Simret Ayele", email: "simret.ayele@gmail.com", phone: "0922334455", address: "CMC, Addis Ababa", alt_phone: "", active: true },
  { id: 6, full_name: "Dawit Bekele", email: "dawit.bekele@outlook.com", phone: "0912112233", address: "Ayat, Addis Ababa", alt_phone: "+251912345600", active: true },
  { id: 7, full_name: "Meron Desta", email: "meron.desta@live.com", phone: "0911990011", address: "Kazanchis, Addis Ababa", alt_phone: "", active: true },
  { id: 8, full_name: "Bethlehem Getachew", email: "betty.get@yahoo.com", phone: "0935445566", address: "Lideta, Addis Ababa", alt_phone: "+251930112244", active: true },
  { id: 9, full_name: "Henok Tadesse", email: "henok.tad@ethiopian.com", phone: "0911778899", address: "Mexico, Addis Ababa", alt_phone: "", active: true },
  { id: 10, full_name: "Kalkidan Alemu", email: "kalki.alemu@gmail.com", phone: "0920113355", address: "Sarbet, Addis Ababa", alt_phone: "", active: true },
  { id: 11, full_name: "Fitsum Abate", email: "fitsum.abate@outlook.com", phone: "0911883311", address: "Jemo, Addis Ababa", alt_phone: "", active: true },
  { id: 12, full_name: "Ruth Solomon", email: "ruth.solomon@gmail.com", phone: "0945889900", address: "Summit, Addis Ababa", alt_phone: "", active: true },
  { id: 13, full_name: "Abel Tesfaye", email: "abel.tesfaye@gmail.com", phone: "0911440055", address: "Arat Kilo, Addis Ababa", alt_phone: "", active: true },
  { id: 14, full_name: "Samrawit Birhanu", email: "samri@birhanu.com", phone: "0910223344", address: "Gulele, Addis Ababa", alt_phone: "", active: true },
  { id: 15, full_name: "Nahom Fikru", email: "nahom@fikru.com", phone: "0912776655", address: "Kolfe, Addis Ababa", alt_phone: "", active: true },
  { id: 16, full_name: "Rahel Assefa", email: "rahel.assefa@gmail.com", phone: "0913990022", address: "Jemo, Addis Ababa", alt_phone: "", active: true },
  { id: 17, full_name: "Yonas Tsegaye", email: "yonas.tsegaye@outlook.com", phone: "0911663322", address: "Bole, Addis Ababa", alt_phone: "", active: true },
  { id: 18, full_name: "Eden Wolde", email: "eden.wolde@gmail.com", phone: "0929554433", address: "CMC, Addis Ababa", alt_phone: "", active: true },
  { id: 19, full_name: "Yohannes Kebede", email: "yohannes.kebede@gmail.com", phone: "0911123456", address: "Lideta, Addis Ababa", alt_phone: "", active: true },
  { id: 20, full_name: "Tigist Hailu", email: "tigist.hailu@yahoo.com", phone: "0911987654", address: "Piassa, Addis Ababa", alt_phone: "", active: true },
  { id: 21, full_name: "Almaz Demissie", email: "almaz.dem@hotmail.com", phone: "0940123456", address: "Gerji, Addis Ababa", alt_phone: "", active: true },
  { id: 22, full_name: "Solomon Negash", email: "solomon.negash@outlook.com", phone: "0911456789", address: "Kazanchis, Addis Ababa", alt_phone: "", active: true },
  { id: 23, full_name: "Hana Gebremedhin", email: "hana.gebremedhin@gmail.com", phone: "+251911223344", address: "Bole, Addis Ababa", alt_phone: "+251911223399", active: true },
  { id: 24, full_name: "Ruth Mekonnen", email: "ruth.m@gmail.com", phone: "+251944556677", address: "Megenagna, Addis Ababa", alt_phone: "", active: true },
  { id: 25, full_name: "Samuel Fikru", email: "samuel.f@gmail.com", phone: "0912112211", address: "Piassa, Addis Ababa", alt_phone: "", active: true },
  { id: 26, full_name: "Bekele Shiferaw", email: "bekele.shif@gmail.com", phone: "0911776633", address: "Megenagna, Addis Ababa", alt_phone: "", active: true },
  { id: 27, full_name: "Selamawit Tsegaye", email: "selam.tsegaye@gmail.com", phone: "0912334455", address: "Bole, Addis Ababa", alt_phone: "", active: true },
  { id: 28, full_name: "Kassa Belay", email: "kassa.belay@outlook.com", phone: "0911405060", address: "Kolfe, Addis Ababa", alt_phone: "", active: true }
];

export const INITIAL_DEVICES: Device[] = [
  { id: 1, customer_id: 4, device_type: "Laptop", brand: "Dell", model: "Latitude 7490", serial_number: "SN-DEL-LAT-7490-A", issue_description: "SSD upgrade & software diagnostic", created_at: "2026-04-10T10:00:00Z" },
  { id: 2, customer_id: 5, device_type: "Laptop", brand: "HP", model: "EliteBook 840 G5", serial_number: "SN-HP-ELB-840-G5", issue_description: "Keyboard key sticky and RAM diagnostic code error", created_at: "2026-04-12T11:15:00Z" },
  { id: 3, customer_id: 6, device_type: "Laptop", brand: "Lenovo", model: "ThinkPad T480", serial_number: "SN-LNV-T480-221", issue_description: "Broken charging port and power issue", created_at: "2026-04-15T09:30:00Z" },
  { id: 4, customer_id: 7, device_type: "Laptop", brand: "Acer", model: "Aspire 5", serial_number: "SN-ACR-ASP5-XX", issue_description: "Slow performance and Windows boot loop", created_at: "2026-04-18T14:20:00Z" },
  { id: 5, customer_id: 8, device_type: "Laptop", brand: "ASUS", model: "VivoBook", serial_number: "SN-ASU-VV15-Y2", issue_description: "Crack on the display screen replace", created_at: "2026-04-20T16:00:00Z" },
  { id: 6, customer_id: 9, device_type: "Laptop", brand: "Toshiba", model: "Satellite Pro", serial_number: "SN-TSH-SAT-8822", issue_description: "Battery not charging issue", created_at: "2026-04-22T10:10:00Z" },
  { id: 7, customer_id: 10, device_type: "Laptop", brand: "Apple", model: "MacBook Pro 2019", serial_number: "SN-APL-MBP2019", issue_description: "Water damage on systemboard", created_at: "2026-04-24T12:00:00Z" },
  { id: 8, customer_id: 11, device_type: "Laptop", brand: "HP", model: "Pavilion 15", serial_number: "SN-HP-PAV15-X1", issue_description: "Cooling Fan overheating & thermal noise", created_at: "2026-04-26T15:30:00Z" },
  { id: 9, customer_id: 12, device_type: "Laptop", brand: "Dell", model: "Inspiron 15", serial_number: "SN-DEL-INS15-M", issue_description: "RAM module failure and blue screen error", created_at: "2026-04-28T11:45:00Z" },
  { id: 10, customer_id: 13, device_type: "Laptop", brand: "Lenovo", model: "IdeaPad", serial_number: "SN-LNV-IDP3-009", issue_description: "Broken screen bezel hinges calibration", created_at: "2026-05-01T09:00:00Z" },
  { id: 11, customer_id: 14, device_type: "Desktop", brand: "Lenovo", model: "ThinkCentre M720q", serial_number: "SN-LNV-TC-M720", issue_description: "No power after lighting storm surge", created_at: "2026-05-03T10:30:00Z" },
  { id: 12, customer_id: 15, device_type: "Laptop", brand: "HP", model: "EliteBook 840 G4", serial_number: "SN-HP-EB-840G4", issue_description: "BIOS corruption update failure recover", created_at: "2026-05-05T14:15:00Z" },
  { id: 13, customer_id: 16, device_type: "Laptop", brand: "Apple", model: "MacBook Pro M1 2020", serial_number: "SN-APL-MBP-M1", issue_description: "USB Type-C port failure diagnostics", created_at: "2026-05-06T11:00:00Z" },
  { id: 14, customer_id: 17, device_type: "Laptop", brand: "Dell", model: "Latitude 5490", serial_number: "SN-DEL-LAT-5490", issue_description: "OS corruption and system cleanup", created_at: "2026-05-08T16:20:00Z" },
  { id: 15, customer_id: 18, device_type: "Laptop", brand: "Lenovo", model: "ThinkPad T490s", serial_number: "SN-LNV-T490S", issue_description: "Internal WiFi cards interface failure replace", created_at: "2026-05-10T10:45:00Z" },
  { id: 16, customer_id: 19, device_type: "Laptop", brand: "HP", model: "Pavilion Gaming 15", serial_number: "SN-HP-PG15-22", issue_description: "Overheating & cleaning thermal GPU compound", created_at: "2026-05-12T13:10:00Z" },
  { id: 17, customer_id: 20, device_type: "Laptop", brand: "Dell", model: "Inspiron 3511", serial_number: "SN-DEL-INS3511", issue_description: "M.2 SSD dead recovery partition failure", created_at: "2026-05-14T09:15:00Z" },
  { id: 18, customer_id: 21, device_type: "Laptop", brand: "Apple", model: "MacBook Air M1", serial_number: "SN-APL-MBA-M1-B", issue_description: "Trackpad unresponsive hardware replace", created_at: "2026-05-15T10:15:00Z" },
  { id: 19, customer_id: 22, device_type: "Laptop", brand: "ASUS", model: "ROG Zephyrus", serial_number: "SN-ASU-ZEPH", issue_description: "Liquid metal repaste or diagnostics", created_at: "2026-05-16T15:40:00Z" },
  { id: 20, customer_id: 23, device_type: "Laptop", brand: "Acer", model: "Swift 3", serial_number: "SN-ACR-SWFT3", issue_description: "Keyboard fluid layout sticky keys", created_at: "2026-05-18T11:30:00Z" },
  { id: 21, customer_id: 24, device_type: "Laptop", brand: "HP", model: "EliteBook 830 G6", serial_number: "SN-HP-EB-830G6", issue_description: "Screen flicker diagnostic and screen repair", created_at: "2026-05-19T14:00:00Z" },
  { id: 22, customer_id: 25, device_type: "Laptop", brand: "Lenovo", model: "ThinkPad L14", serial_number: "SN-LNV-L14-991", issue_description: "Battery fails to power on", created_at: "2026-05-20T10:50:00Z" },
  { id: 23, customer_id: 26, device_type: "Laptop", brand: "Dell", model: "Alienware m15", serial_number: "SN-DEL-AW-M15", issue_description: "Motherboard short circuit micro-soldering", created_at: "2026-05-22T09:30:00Z" },
  { id: 24, customer_id: 27, device_type: "Laptop", brand: "Apple", model: "MacBook Pro 14 M2", serial_number: "SN-APL-MBP14M2", issue_description: "Solder logic board DC charger rail short", created_at: "2026-05-23T11:15:00Z" },
  { id: 25, customer_id: 28, device_type: "Laptop", brand: "ASUS", model: "Vivobook Flip", serial_number: "SN-ASU-VVF-909", issue_description: "Broken screen digitizer hinge replace", created_at: "2026-05-25T14:40:00Z" }
];

export const INITIAL_TICKETS: RepairTicket[] = [
  { id: 101, customer_id: 4, customer_name: "Girma Hailu", device_id: 1, device_brand: "Dell", device_model: "Latitude 7490", status: "Completed", issue_description: "SSD upgrade & software diagnostic", logs: ["Opened ticket for SSD replacement upgrade.", "Installed Crucial 500GB NVMe SSD.", "Completed OS deploy & migration check.", "Ready for collection."], technician_name: "Abebe Chala", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 102, customer_id: 5, customer_name: "Simret Ayele", device_id: 2, device_brand: "HP", device_model: "EliteBook 840 G5", status: "Completed", issue_description: "Keyboard key sticky and RAM diagnostic code error", logs: ["Opened desk log registry.", "Tested and found bad RAM sector, replaced modules.", "Cleared keyboard carbon deposits.", "Fully tested and validated operational."], technician_name: "Dawit Alemu", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 103, customer_id: 6, customer_name: "Dawit Bekele", device_id: 3, device_brand: "Lenovo", device_model: "ThinkPad T480", status: "Completed", issue_description: "Broken charging port and power issue", logs: ["Intake review: Solder charging port is mechanically broken from mother board.", "Re-soldered internal DC jack adapter pins.", "Mainboard power cycle tests pass successfully."], technician_name: "Abebe Chala", remote_request: true, pickup_required: true, customer_address: "Ayat, Addis Ababa", contact_phone: "0912112233", delivery_tracking_status: "Completed", request_source: "Remote Request" },
  { id: 104, customer_id: 7, customer_name: "Meron Desta", device_id: 4, device_brand: "Acer", device_model: "Aspire 5", status: "Completed", issue_description: "Slow performance and Windows boot loop", logs: ["Logged walk-in request.", "Formatted drive and updated Windows 11 system.", "Optimal CPU heat thresholds achieved."], technician_name: "Henok Tadesse", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 105, customer_id: 8, customer_name: "Bethlehem Getachew", device_id: 5, device_brand: "ASUS", device_model: "VivoBook", status: "Completed", issue_description: "Crack on the display screen replace", logs: ["Diagnosed panel crack.", "Substituted screen module.", "Verified panel RGB color output."], technician_name: "Henok Tadesse", remote_request: true, pickup_required: true, customer_address: "Lideta, Addis Ababa", contact_phone: "0935445566", delivery_tracking_status: "Completed", request_source: "Remote Request" },
  { id: 106, customer_id: 9, customer_name: "Henok Tadesse", device_id: 6, device_brand: "Toshiba", device_model: "Satellite Pro", status: "Completed", issue_description: "Battery not charging issue", logs: ["Tested cells. Replaced worn-out notebook battery cells.", "Calibrated charging cycle."], technician_name: "Abebe Chala", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 107, customer_id: 10, customer_name: "Kalkidan Alemu", device_id: 7, device_brand: "Apple", device_model: "MacBook Pro 2019", status: "Completed", issue_description: "Water damage on systemboard", logs: ["Corrosion spots located under microscopic analysis.", "Cleaned PCB in ultrasonic chamber.", "Re-soldered power gating transistors.", "Booted macOS system successfully."], technician_name: "Abebe Chala", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 108, customer_id: 11, customer_name: "Fitsum Abate", device_id: 8, device_brand: "HP", device_model: "Pavilion 15", status: "Completed", issue_description: "Cooling Fan overheating & thermal noise", logs: ["Opened plastic case.", "Washed copper heat exchangers.", "Replaced faulty fan rotor.", "Applied high density MX-4 silicone cream."], technician_name: "Dawit Alemu", remote_request: true, pickup_required: true, customer_address: "Jemo, Addis Ababa", contact_phone: "0911883311", delivery_tracking_status: "Completed", request_source: "Remote Request" },
  { id: 109, customer_id: 12, customer_name: "Ruth Solomon", device_id: 9, device_brand: "Dell", device_model: "Inspiron 15", status: "Completed", issue_description: "RAM module failure and blue screen error", logs: ["Diagnosed BSOD memory access errors.", "Replaced faulty SK-Hynix 8GB module.", "Memory health diagnostic 100% passes."], technician_name: "Henok Tadesse", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 110, customer_id: 13, customer_name: "Abel Tesfaye", device_id: 10, device_brand: "Lenovo", device_model: "IdeaPad", status: "Completed", issue_description: "Broken screen bezel hinges calibration", created_at: "2026-05-01T09:00:00Z", logs: ["Replaced steel bracket loops.", "Secured frame with epoxy compounds."], technician_name: "Dawit Alemu", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 111, customer_id: 14, customer_name: "Samrawit Birhanu", device_id: 11, device_brand: "Lenovo", device_model: "ThinkCentre M720q", status: "Completed", issue_description: "No power after lighting storm surge", logs: ["Re-soldered input safety fuses.", "Replaced short circuit varistor diode.", "Tested continuous 19V supply."], technician_name: "Abebe Chala", remote_request: true, pickup_required: true, customer_address: "Gulele, Addis Ababa", contact_phone: "0910223344", delivery_tracking_status: "Completed", request_source: "Remote Request" },
  { id: 112, customer_id: 15, customer_name: "Nahom Fikru", device_id: 12, device_brand: "HP", device_model: "EliteBook 840 G4", status: "Completed", issue_description: "BIOS corruption update failure recover", logs: ["De-soldered BIOS package manually.", "Flashed clean hex kernel via hardware programmer.", "Re-soldered BIOS surface component.", "System post and bios menu accessible."], technician_name: "Abebe Chala", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 113, customer_id: 16, customer_name: "Rahel Assefa", device_id: 13, device_brand: "Apple", device_model: "MacBook Pro M1 2020", status: "Completed", issue_description: "USB Type-C port failure diagnostics", logs: ["Diagnosed physically worn lightning pins.", "Exchanged logic controller ports."], technician_name: "Abebe Chala", remote_request: true, pickup_required: true, customer_address: "Jemo, Addis Ababa", contact_phone: "0913990022", delivery_tracking_status: "Completed", request_source: "Remote Request" },
  { id: 114, customer_id: 17, customer_name: "Yonas Tsegaye", device_id: 14, device_brand: "Dell", device_model: "Latitude 5490", status: "Completed", issue_description: "OS corruption and system cleanup", logs: ["Cleared virus partitions.", "Installed original setup updates."], technician_name: "Henok Tadesse", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 115, customer_id: 18, customer_name: "Eden Wolde", device_id: 15, device_brand: "Lenovo", device_model: "ThinkPad T490s", status: "Completed", issue_description: "Internal WiFi cards interface failure replace", logs: ["Detected hardware signal failure.", "Exchanged Intel PCIe WLAN network module.", "Checked 5G router speeds successfully."], technician_name: "Dawit Alemu", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 116, customer_id: 19, customer_name: "Yohannes Kebede", device_id: 16, device_brand: "HP", device_model: "Pavilion Gaming 15", status: "Completed", issue_description: "Overheating & cleaning thermal GPU compound", logs: ["Cleaned dust bunnies under cooling blocks.", "Pasted quality silicon matrix.", "Run stress trials. Lower temperatures confirmed."], technician_name: "Dawit Alemu", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 117, customer_id: 20, customer_name: "Tigist Hailu", device_id: 17, device_brand: "Dell", device_model: "Inspiron 3511", status: "Completed", issue_description: "M.2 SSD dead recovery partition failure", logs: ["Swapped dead SATA module to Kingston 500GB PCIe disk.", "Re-deployed workspace clean copy."], technician_name: "Henok Tadesse", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 118, customer_id: 21, customer_name: "Almaz Demissie", device_id: 18, device_brand: "Apple", device_model: "MacBook Air M1", status: "Completed", issue_description: "Trackpad unresponsive hardware replace", logs: ["Exposed trackpad contacts.", "Cleaned dirty liquid stains and traces.", "Verified touch sensitivities standard."], technician_name: "Dawit Alemu", remote_request: true, pickup_required: true, customer_address: "Gerji, Addis Ababa", contact_phone: "0940123456", delivery_tracking_status: "Completed", request_source: "Remote Request" },
  { id: 119, customer_id: 22, device_id: 19, customer_name: "Solomon Negash", device_brand: "ASUS", device_model: "ROG Zephyrus", status: "Completed", issue_description: "Liquid metal repaste or diagnostics", logs: ["Carefully separated board.", "Repasted high density thermal core."], technician_name: "Dawit Alemu", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 120, customer_id: 23, device_id: 20, customer_name: "Hana Gebremedhin", device_brand: "Acer", device_model: "Swift 3", status: "Completed", issue_description: "Keyboard fluid layout sticky keys", logs: ["Replaced standard internal keyboard tray matrix.", "Ensured key operations 100% stable."], technician_name: "Henok Tadesse", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 121, customer_id: 24, device_id: 21, customer_name: "Ruth Mekonnen", device_brand: "HP", device_model: "EliteBook 830 G6", status: "Completed", issue_description: "Screen flicker diagnostic and screen repair", logs: ["Traced power connection flex cable ribbon damage.", "Replaced panel display connector flat cable."], technician_name: "Dawit Alemu", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  { id: 122, customer_id: 25, device_id: 22, customer_name: "Samuel Fikru", device_brand: "Lenovo", device_model: "ThinkPad L14", status: "Completed", issue_description: "Battery fails to power on", logs: ["Swapped dead lithium modules.", "Tested notebook cycles. Passed validation tests."], technician_name: "Abebe Chala", remote_request: false, pickup_required: false, delivery_tracking_status: "Completed", request_source: "Walk-in" },
  
  // Unresolved Cases: Only 3 (2 unresolved "In Progress" / "Waiting for Parts", 1 walk-in "Created")
  { id: 123, customer_id: 26, customer_name: "Bekele Shiferaw", device_id: 23, device_brand: "Dell", device_model: "Alienware m15", status: "In Progress", issue_description: "Motherboard short circuit micro-soldering", logs: ["Opened ticket logic system board diagnosis.", "Diagnosed short capacitors on main voltage rail.", "Analyzing schematic components layout."], technician_name: "Abebe Chala", remote_request: true, pickup_required: true, customer_address: "Megenagna, Addis Ababa", contact_phone: "0911776633", delivery_tracking_status: "In Repair", request_source: "Remote Request" },
  { id: 124, customer_id: 27, customer_name: "Selamawit Tsegaye", device_id: 24, device_brand: "Apple", device_model: "MacBook Pro 14 M2", status: "Waiting for Spare Parts", issue_description: "Solder logic board DC charger rail short", logs: ["Identified cracked system coil.", "Requires specific replacement silicon chip from import.", "Customer approved quote. Order dispatched to international transit waitlist."], technician_name: "Abebe Chala", remote_request: true, pickup_required: true, customer_address: "Bole, Addis Ababa", contact_phone: "0912334455", delivery_tracking_status: "None", request_source: "Remote Request" },
  { id: 125, customer_id: 28, customer_name: "Kassa Belay", device_id: 25, device_brand: "ASUS", device_model: "Vivobook Flip", status: "Created", issue_description: "Broken screen digitizer hinge replace", logs: ["Walk-in device submitted.", "Awaiting specialist allocation diagnostics."], technician_name: undefined, remote_request: false, pickup_required: false, delivery_tracking_status: "None", request_source: "Walk-in" }
];

export const INITIAL_INVENTORY: SparePart[] = [
  { id: 1, part_name: "Kingston 16GB DDR4 Laptop RAM", serial_number: "KNG-DDR4-16G", stock_quantity: 14, unit_price: 2500.00, low_stock_threshold: 5 },
  { id: 2, part_name: "Crucial 500GB NVMe SSD Fast", serial_number: "CRU-SSD-500", stock_quantity: 8, unit_price: 4800.00, low_stock_threshold: 4 },
  { id: 3, part_name: "Original HP EliteBook keyboard deck", serial_number: "HP-KBD-EB840", stock_quantity: 3, unit_price: 3200.00, low_stock_threshold: 2 },
  { id: 4, part_name: "Lithium replacement cell Apple Air", serial_number: "APL-BAT-MBAIR", stock_quantity: 5, unit_price: 6500.00, low_stock_threshold: 2 },
  { id: 5, part_name: "Replacement IPS Panel 15.6 LED", serial_number: "IPS-PNL-156", stock_quantity: 11, unit_price: 7800.00, low_stock_threshold: 3 },
  { id: 6, part_name: "Genuine Dell 65W charger adapter", serial_number: "DEL-PWR-65W", stock_quantity: 20, unit_price: 1800.00, low_stock_threshold: 5 }
];

export const INITIAL_DELIVERIES: Delivery[] = [
  { id: 501, ticket_id: 103, customer_name: "Dawit Bekele", shipping_destination: "Ayat, Addis Ababa", status: "Handed Over", courier: "Abdi Mohammed", notes: "Delivered to customer's residence. Confirmed functional." },
  { id: 502, ticket_id: 105, customer_name: "Bethlehem Getachew", shipping_destination: "Lideta, Addis Ababa", status: "Handed Over", courier: "Kaleab Birhanu", notes: "Fragile screen unit returned safely. Customer checked screen quality." },
  { id: 503, ticket_id: 108, customer_name: "Fitsum Abate", shipping_destination: "Jemo, Addis Ababa", status: "Handed Over", courier: "Abdi Mohammed", notes: "Pickup completed at Jemo, delivery return confirmed by client." },
  { id: 504, ticket_id: 111, customer_name: "Samrawit Birhanu", shipping_destination: "Gulele, Addis Ababa", status: "Handed Over", courier: "Kaleab Birhanu", notes: "PC tower safely delivered. Payment settled offline." },
  { id: 505, ticket_id: 113, customer_name: "Rahel Assefa", shipping_destination: "Jemo, Addis Ababa", status: "Handed Over", courier: "Yared Wolde", notes: "Completed handover." },
  { id: 506, ticket_id: 118, customer_name: "Almaz Demissie", shipping_destination: "Gerji, Addis Ababa", status: "Handed Over", courier: "Kaleab Birhanu", notes: "MacBook returned safely in signature packing seal." },
  { id: 507, ticket_id: 123, customer_name: "Bekele Shiferaw", shipping_destination: "Megenagna, Addis Ababa", status: "In Transit", courier: "Yared Wolde", notes: "Hardware retrieved. Transporting to Bole center workshop." },
  { id: 508, ticket_id: 124, customer_name: "Selamawit Tsegaye", shipping_destination: "Bole, Addis Ababa", status: "In Transit", courier: "Abdi Mohammed", notes: "Transported device to workshop shelf diagnostics." },
  { id: 509, ticket_id: 101, customer_name: "Girma Hailu", shipping_destination: "Gerji, Addis Ababa", status: "Handed Over", courier: "Kaleab Birhanu", notes: "Completed." },
  { id: 510, ticket_id: 102, customer_name: "Simret Ayele", shipping_destination: "CMC, Addis Ababa", status: "Handed Over", courier: "Abdi Mohammed", notes: "Handover completed." }
];

export const INITIAL_INVOICES: Invoice[] = [
  ...Array.from({ length: 22 }, (_, i) => {
    const ticketId = 101 + i;
    const client = INITIAL_CUSTOMERS[i % INITIAL_CUSTOMERS.length];
    const dev = INITIAL_DEVICES[i % INITIAL_DEVICES.length];
    const baseServiceCost = 350.00 + (i * 120.00);
    const spareCost = i % 2 === 0 ? 1200.00 + (i * 150.00) : 0;
    const baseTotal = baseServiceCost + spareCost;
    const taxAddition = baseTotal * 1.15;
    
    return {
      id: 801 + i,
      ticket_id: ticketId,
      customer_id: client.id,
      customer_name: client.full_name,
      customer_email: client.email,
      customer_phone: client.phone,
      customer_address: client.address,
      device_brand: dev.brand,
      device_model: dev.model,
      device_type: dev.device_type,
      device_serial: dev.serial_number,
      technician_name: i % 2 === 0 ? "Abebe Chala" : "Dawit Alemu",
      service_cost: baseServiceCost,
      spare_parts_cost: spareCost,
      tax_multiplier: 1.15,
      total_amount: Math.round(taxAddition * 100) / 100,
      payment_status: "Paid" as const,
      invoice_date: new Date(2026, 3, 10 + i, 11, 0, 0).toISOString()
    };
  }),

  // Unresolved Invoices
  {
    id: 823,
    ticket_id: 123,
    customer_id: 26,
    customer_name: "Bekele Shiferaw",
    customer_email: "bekele.shif@gmail.com",
    customer_phone: "0911776633",
    customer_address: "Megenagna, Addis Ababa",
    device_brand: "Dell",
    device_model: "Alienware m15",
    device_type: "Laptop",
    device_serial: "SN-DEL-AW-M15",
    technician_name: "Abebe Chala",
    service_cost: 1500.00,
    spare_parts_cost: 0,
    tax_multiplier: 1.15,
    total_amount: 1725.00,
    payment_status: "Paid", // Checked out/Receipt matched
    invoice_date: "2026-05-22T10:00:00Z"
  },
  {
    id: 824,
    ticket_id: 124,
    customer_id: 27,
    customer_name: "Selamawit Tsegaye",
    customer_email: "selam.tsegaye@gmail.com",
    customer_phone: "0912334455",
    customer_address: "Bole, Addis Ababa",
    device_brand: "Apple",
    device_model: "MacBook Pro 14 M2",
    device_type: "Laptop",
    device_serial: "SN-APL-MBP14M2",
    technician_name: "Abebe Chala",
    service_cost: 2500.00,
    spare_parts_cost: 8500.00, // Board import quote
    tax_multiplier: 1.15,
    total_amount: 12650.00,
    payment_status: "Unpaid",
    invoice_date: "2026-05-23T11:30:00Z"
  },
  {
    id: 825,
    ticket_id: 125,
    customer_id: 28,
    customer_name: "Kassa Belay",
    customer_email: "kassa.belay@outlook.com",
    customer_phone: "0911405060",
    customer_address: "Kolfe, Addis Ababa",
    device_brand: "ASUS",
    device_model: "Vivobook Flip",
    device_type: "Laptop",
    device_serial: "SN-ASU-VVF-909",
    technician_name: "Abebe Chala",
    service_cost: 350.00, // Basic diagnostics quote
    spare_parts_cost: 0,
    tax_multiplier: 1.15,
    total_amount: 402.50,
    payment_status: "Unpaid",
    invoice_date: "2026-05-25T15:00:00Z"
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  { id: 1, customerId: 4, clientName: "Girma Hailu", messageText: "Is my Dell Laptop backup SSD disk upgrade finalized?", responseText: "Yes, our specialist Abebe Chala completed the copy, you can collect it anytime in our Bole branch.", status: "Responded" },
  { id: 2, customerId: 5, clientName: "Simret Ayele", messageText: "Can I receive a quote for the 8GB stick RAM?", responseText: "Greetings Simret! The price is exactly 2,500 Birr including labor fees.", status: "Responded" },
  { id: 3, customerId: 6, clientName: "Dawit Bekele", messageText: "Please expedite delivery to Ayat district near the train station.", responseText: "Our courier Abdi is dispatched. Arriving shortly.", status: "Responded" },
  { id: 4, customerId: 7, clientName: "Meron Desta", messageText: "Can we install Windows Defender offline tools?", responseText: "Sure, we installed all required updates & cybersecurity patches.", status: "Responded" },
  { id: 5, customerId: 8, clientName: "Bethlehem Getachew", messageText: "Do you supply laptop screen replacements with warranty?", responseText: "Yes! All display screen items have full 6 months service warranty covers.", status: "Responded" },
  { id: 6, customerId: 26, clientName: "Bekele Shiferaw", messageText: "Any response regarding the short circuit diagnostics on the Alienware?", responseText: "Technician is reviewing board gate capacitors. We sent detailed quote recommendations inside your diagnostic tab.", status: "Responded" },
  { id: 7, customerId: 27, clientName: "Selamawit Tsegaye", messageText: "Greetings. Let me know when the custom Apple charger board logic chip arrives.", responseText: "", status: "Received" },
  { id: 8, customerId: 28, clientName: "Kassa Belay", messageText: "Does the walk-in inspection require upfront deposit payment?", responseText: "The standard assessment and diagnostic report work-hours is 350 Birr, settled at desk.", status: "Responded" },
  { id: 9, customerId: 10, clientName: "Kalkidan Alemu", messageText: "My MacBook runs cooler. Thanks for logic board corrosion cleanups!", responseText: "We are glad to keep your device healthy. Stay safe!", status: "Responded" },
  { id: 10, customerId: 11, clientName: "Fitsum Abate", messageText: "Does my repair invoice receipt support digital print transfers?", responseText: "Yes! All invoices inside CRSTMS can be parsed, printed, or exported.", status: "Responded" }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  { id: 1, name: "Abebe Chala", speciality: "MicroSolder Repairs Specialists", availability: "Available", assignedTicketsCount: 11, desk: "Bench 1, Bole Station" },
  { id: 2, name: "Dawit Alemu", speciality: "Systems & Network Architectures", availability: "Busy", assignedTicketsCount: 8, desk: "Server Control Desk 02" },
  { id: 3, name: "Henok Tadesse", speciality: "Demographics & Intake Diagnostics", availability: "Available", assignedTicketsCount: 6, desk: "Intake Station 01" }
];

export const INITIAL_RECEIPT_UPLOADS: ReceiptUpload[] = [
  { id: 1, invoice_id: 801, customer_name: "Girma Hailu", uploaded_filename: "CBE_BIRR_FT26115_Girma.jpg", uploaded_at: "2026-04-12T14:30:00Z", status: "Approved", approved_by: "Simret Ayele", approval_notes: "CBE transaction reference confirmed on central office dashboard ledger." },
  { id: 2, invoice_id: 802, customer_name: "Simret Ayele", uploaded_filename: "TELEBIRR_REF_7719B_AYELE.jpg", uploaded_at: "2026-04-14T11:00:00Z", status: "Approved", approved_by: "Simret Ayele", approval_notes: "Checked Telebirr merchant platform. Ledger match confirmed." },
  { id: 3, invoice_id: 803, customer_name: "Dawit Bekele", uploaded_filename: "BOA_TRANSFER_REF889_DAWIT.png", uploaded_at: "2026-04-17T09:45:00Z", status: "Approved", approved_by: "Henok Tadesse", approval_notes: "Bank of Abyssinia mobile transfer confirmation validated." },
  { id: 4, invoice_id: 805, customer_name: "Bethlehem Getachew", uploaded_filename: "CBE_MOBILE_T_9112_BETHY.jpg", uploaded_at: "2026-05-02T16:15:00Z", status: "Approved", approved_by: "Simret Ayele", approval_notes: "Approved after terminal ledger reconciliation." },
  { id: 5, invoice_id: 808, customer_name: "Fitsum Abate", uploaded_filename: "TELEBIRR_991823_FITSUM.png", uploaded_at: "2026-05-08T10:00:00Z", status: "Approved", approved_by: "Simret Ayele", approval_notes: "Merchant confirmation voucher verified." },
  { id: 6, invoice_id: 811, customer_name: "Samrawit Birhanu", uploaded_filename: "AIB_REF_44192_SAMRI.jpg", uploaded_at: "2026-05-11T12:00:00Z", status: "Approved", approved_by: "Dawit Alemu", approval_notes: "Awash Bank corporate transfer cleared." },
  { id: 7, invoice_id: 813, customer_name: "Rahel Assefa", uploaded_filename: "TELEBIRR_RAHEL_RST.png", uploaded_at: "2026-05-13T15:30:00Z", status: "Approved", approved_by: "Simret Ayele", approval_notes: "Automatic gateway matching successful." },
  { id: 8, invoice_id: 818, customer_name: "Almaz Demissie", uploaded_filename: "CBE_BIRR_FT99812_ALMAZ.jpg", uploaded_at: "2026-05-19T11:00:00Z", status: "Approved", approved_by: "Simret Ayele", approval_notes: "CBE receipt confirmed." },
  { id: 9, invoice_id: 823, customer_name: "Bekele Shiferaw", uploaded_filename: "TELEBIRR_9921_AL_SHIF.png", uploaded_at: "2026-05-23T10:20:00Z", status: "Pending", approval_notes: "Awaiting final clearance check from finance desk account." },
  { id: 10, invoice_id: 824, customer_name: "Selamawit Tsegaye", uploaded_filename: "CBE_TRANS_9011_SELAM.png", uploaded_at: "2026-05-24T12:00:00Z", status: "Rejected", approved_by: "Simret Ayele", approval_notes: "Incorrect amount uploaded. Receipt shows previous year's transaction reference. Customer requested to re-upload." }
];

export const INITIAL_LOGS: SystemLog[] = [
  { id: 1, user_id: 1, userName: "System Admin", action_type: "DB_INIT", affected_module: "Database", reference_id: "L100", details: "CRSTMS production-ready localized database successfully seeded with 100 historical operational records.", created_at: "2026-04-10T08:00:00Z" },
  { id: 2, user_id: 2, userName: "Simret Ayele", action_type: "LOGIN", affected_module: "Authentication", reference_id: "2", details: "Receptionist Simret Ayele session generated via secure web gateway.", created_at: "2026-04-10T08:30:00Z" },
  { id: 3, user_id: 2, userName: "Simret Ayele", action_type: "CREATE_CUSTOMER", affected_module: "Customers", reference_id: "4", details: "Enrolled customer Girma Hailu with address Gerji, Addis Ababa.", created_at: "2026-04-10T08:45:00Z" },
  { id: 4, user_id: 3, userName: "Abebe Chala", action_type: "INITIAL_DIAG", affected_module: "Tickets", reference_id: "101", details: "Solder bench assessment initialized for Dell Latitude #101.", created_at: "2026-04-10T11:00:00Z" },
  { id: 5, user_id: 3, userName: "Abebe Chala", action_type: "CONSUME_SUPPORT_PART", affected_module: "Inventory", reference_id: "2", details: "Deducted 1 unit of Crucial 500GB SSD for Ticket #101 diagnostic closeout.", created_at: "2026-04-10T14:15:00Z" },
  { id: 6, user_id: 2, userName: "Simret Ayele", action_type: "APPROVE_RECEIPT", affected_module: "Invoices", reference_id: "801", details: "Verified CBE deposit slip FT26115 for invoice #801 uploaded by Girma Hailu.", created_at: "2026-04-12T14:45:00Z" },
  { id: 7, user_id: 2, userName: "Simret Ayele", action_type: "APPROVE_RECEIPT", affected_module: "Invoices", reference_id: "802", details: "Approved Telebirr online slip 7719B for invoice #802.", created_at: "2026-04-14T11:30:00Z" },
  { id: 8, user_id: 3, userName: "Abebe Chala", action_type: "RE-SOLDER", affected_module: "Tickets", reference_id: "103", details: "Repaired broken DC jack mainboard socket on ThinkPad #103.", created_at: "2026-04-16T15:00:00Z" },
  { id: 9, user_id: 2, userName: "Simret Ayele", action_type: "DISPATCH_COURIER", affected_module: "Logistics", reference_id: "501", details: "Dispatched courier Abdi Mohammed to complete return delivery to Ayat district.", created_at: "2026-04-17T09:00:00Z" },
  { id: 10, user_id: 2, userName: "Simret Ayele", action_type: "APPROVE_RECEIPT", affected_module: "Invoices", reference_id: "808", details: "Approved credit receipt telebirr payment reference for Fitsum Abate.", created_at: "2026-05-08T10:15:00Z" },
  { id: 11, user_id: 3, userName: "Abebe Chala", action_type: "POST_DIAG", affected_module: "Tickets", reference_id: "123", details: "Motherboard short analysis on capacitor rail for Bekele Shiferaw Alienware T15.", created_at: "2026-05-22T10:30:00Z" },
  { id: 12, user_id: 2, userName: "Simret Ayele", action_type: "REJECT_RECEIPT", affected_module: "Invoices", reference_id: "824", details: "Rejected Selamawit Tsegaye's incorrect CBE transaction upload.", created_at: "2026-05-24T12:05:00Z" }
];
