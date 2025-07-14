const prisma = require("../config/prisma");

// Middleware ສຳລັບການ validate ຂໍ້ມູນລູກຄ້າ
const validateCustomerData = (req, res, next) => {
  const { fname, lname, number, email, numberDocuments, documentsType } = req.body;

  // ກວດສອບຟິວທີ່ຈຳເປັນ
  if (!fname || !lname || !number || !email || !numberDocuments || !documentsType) {
    return res.status(400).json({
      message: 'ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ: ຊື່, ນາມສະກຸນ, ເບີໂທ, ອີເມວ, ເລກເອກະສານ, ປະເພດເອກະສານ'
    });
  }

  // ກວດສອບຮູບແບບອີເມວ
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ'
    });
  }

  // ກວດສອບປະເພດເອກະສານທີ່ອະນຸຍາດ
  const allowedDocumentTypes = ['passport', 'id_card', 'driving_license', 'other'];
  if (!allowedDocumentTypes.includes(documentsType.toLowerCase())) {
    return res.status(400).json({
      message: 'ປະເພດເອກະສານບໍ່ຖືກຕ້ອງ (passport, id_card, driving_license, other)'
    });
  }

  next();
};

// Middleware ສຳລັບການ validate ຂໍ້ມູນການສັ່ງຊື້
const validateOrderData = (req, res, next) => {
  const { customerId, customerData, carIds, totalAmount, orderdById } = req.body;

  // ກວດສອບຟິວທີ່ຈຳເປັນ
  if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
    return res.status(400).json({
      message: 'ກະລຸນາເລືອກລົດຢ່າງໜ້ອຍ 1 ຄັນ'
    });
  }

  if (!totalAmount || totalAmount <= 0) {
    return res.status(400).json({
      message: 'ຈຳນວນເງິນຕ້ອງເປັນຕົວເລກທີ່ໃຫຍ່ກວ່າ 0'
    });
  }

  if (!orderdById) {
    return res.status(400).json({
      message: 'ກະລຸນາລະບຸຜູ້ສ້າງຄຳສັ່ງ'
    });
  }

  // ກວດສອບວ່າມີ customerId ຫຼື customerData
  if (!customerId && !customerData) {
    return res.status(400).json({
      message: 'ກະລຸນາເລືອກລູກຄ້າທີ່ມີຢູ່ ຫຼື ປ້ອນຂໍ້ມູນລູກຄ້າໃໝ່'
    });
  }

  // ຖ້າມີ customerData ໃຫ້ validate
  if (customerData) {
    const { fname, lname, number, email, numberDocuments, documentsType } = customerData;
    
    if (!fname || !lname || !number || !email || !numberDocuments || !documentsType) {
      return res.status(400).json({
        message: 'ຂໍ້ມູນລູກຄ້າບໍ່ຄົບຖ້ວນ'
      });
    }

    // ກວດສອບຮູບແບບອີເມວ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'ຮູບແບບອີເມວລູກຄ້າບໍ່ຖືກຕ້ອງ'
      });
    }
  }

  next();
};

// Middleware ສຳລັບການກວດສອບວ່າມີລົດຢູ່ ແລະ ສະຖານະເປັນ Available
const checkCarsAvailable = async (req, res, next) => {
  try {
    const { carIds } = req.body;

    const cars = await prisma.car.findMany({
      where: {
        id: { in: carIds }
      },
      select: {
        id: true,
        name: true,
        licensePlate: true,
        status: true
      }
    });

    // ກວດສອບວ່າພົບລົດທັງໝົດ
    if (cars.length !== carIds.length) {
      const foundCarIds = cars.map(car => car.id);
      const missingCarIds = carIds.filter(id => !foundCarIds.includes(id));
      
      return res.status(404).json({
        message: `ບໍ່ພົບລົດທີ່ມີ ID: ${missingCarIds.join(', ')}`
      });
    }

    // ກວດສອບສະຖານະລົດ
    const unavailableCars = cars.filter(car => car.status !== 'Available');
    if (unavailableCars.length > 0) {
      const carInfo = unavailableCars.map(car => 
        `${car.name || 'ບໍ່ມີຊື່'} (${car.licensePlate}) - ສະຖານະ: ${car.status}`
      ).join(', ');
      
      return res.status(400).json({
        message: `ລົດເຫຼົ່ານີ້ບໍ່ສາມາດຂາຍໄດ້: ${carInfo}`
      });
    }

    next();

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error checkCarsAvailable in middleware!!!"
    });
  }
};

// Middleware ສຳລັບການກວດສອບວ່າມີ User ຢູ່
const checkUserExists = async (req, res, next) => {
  try {
    const { orderdById } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: orderdById },
      select: {
        id: true,
        username: true,
        enabled: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ທີ່ລະບຸ'
      });
    }

    if (!user.enabled) {
      return res.status(403).json({
        message: 'ບັນຊີຜູ້ໃຊ້ນີ້ຖືກປິດການໃຊ້ງານ'
      });
    }

    next();

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error checkUserExists in middleware!!!"
    });
  }
};

// Middleware ສຳລັບການກວດສອບວ່າມີລູກຄ້າຢູ່ (ເມື່ອໃຊ້ customerId)
const checkCustomerExists = async (req, res, next) => {
  try {
    const { customerId } = req.body;

    // ຖ້າບໍ່ມີ customerId ແສດງວ່າຈະສ້າງລູກຄ້າໃໝ່ ສາມາດຜ່ານໄດ້
    if (!customerId) {
      return next();
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        fname: true,
        lname: true,
        enabled: true
      }
    });

    if (!customer) {
      return res.status(404).json({
        message: 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າທີ່ລະບຸ'
      });
    }

    if (!customer.enabled) {
      return res.status(403).json({
        message: 'ບັນຊີລູກຄ້ານີ້ຖືກປິດການໃຊ້ງານ'
      });
    }

    next();

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error checkCustomerExists in middleware!!!"
    });
  }
};

// Middleware ສຳລັບການກວດສອບວ່າມີ Order ຢູ່
const checkOrderExists = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'ID ການສັ່ງຊື້ບໍ່ຖືກຕ້ອງ'
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true
      }
    });

    if (!order) {
      return res.status(404).json({
        message: 'ບໍ່ພົບຂໍ້ມູນການສັ່ງຊື້ທີ່ລະບຸ'
      });
    }

    next();

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error checkOrderExists in middleware!!!"
    });
  }
};

module.exports = {
  validateCustomerData,
  validateOrderData,
  checkCarsAvailable,
  checkUserExists,
  checkCustomerExists,
  checkOrderExists
};