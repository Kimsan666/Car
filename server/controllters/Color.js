const prisma = require("../config/prisma");

exports.saveColorCar = async (req, res) => {
  try {
    // ກຳນົດຕົວແປຮັບຄາຈາກ FontEnd ສົ່ງມາ
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "ກະລຸນາປ້ອນຊື່ສີກ່ອນ" });
    }

    const Name = await prisma.colorCar.findUnique({
      where: {
        name: name,
      },
    });
    if (Name) {
      return res
        .status(400)
        .json({ message: "ມີຊື່ສີໃນ ຕາລາງສີແລ້ວ" });
    }
    const Brand = await prisma.colorCar.create({
      data: {
        name: name,
      },
    });

    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error save colorCar" });
  }
};

exports.listColorCar = async (req, res) => {
  try {
    const Brand = await prisma.colorCar.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error list colorCar" });
  }
};

exports.readColorCar= async (req, res) => {
  try {
    const { id } = req.params;
    const Brand = await prisma.colorCar.findFirst({
      where: {
        id: Number(id),
      },
    });
    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error read colorCar" });
  }
};

exports.updateColorCar = async (req, res) => {
  try {
    const { name } = req.body;
    const colorId = Number(req.params.id);

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const Name = await prisma.colorCar.findUnique({
      where: {
        name: name,
        NOT: { id: colorId },
      },
    });
    if (Name) {
      return res
        .status(400)
        .json({ message: "ມີຊື່ສີນີ້ໃນ ຕາລາງສີແລ້ວ" });
    }

    const existingBrand = await prisma.colorCar.findFirst({
      where: {
        name: name,
        NOT: { id: colorId },
      },
    });

    if (existingBrand) {
      return res.status(400).json({ message: "name already exists" });
    }

    const Brand = await prisma.colorCar.update({
      where: {
        id: colorId,
      },
      data: {
        name: name,
        updatedAt: new Date(), // อัปเดตเวลาที่แก้ไขล่าสุด
      },
    });

    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error update ColorCar" });
  }
};



exports.deleteColorCar = async (req, res) => {
  try {
    const { id } = req.params;
    const colorId = Number(id);

    const brand = await prisma.colorCar.findUnique({
      where: { id: colorId },
    });

    if (!brand) {
      return res.status(404).json({ message: "ບໍ່ພົບສີນີ້" });
    }

    const relatedcars= await prisma.car.findMany({
      where: {
        typeId: colorId,
      },
    });

    if (relatedcars.length > 0) {
      return res.status(400).json({
        message: `ບໍ່ສາມາດລົບສີ "${brand.name}" ໄດ້ ເນື່ອງຈາກຍັງມີສິນຄ້າໃນ car ໃຊ້ຢູ່`,
      });
    }
  
    const deletedBrand = await prisma.colorCar.delete({
      where: { id: colorId },
    });

    res.json({ message: `ລົບສີ "${deletedBrand.name}" ສຳເລັດ` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error delete Brand" });
  }
};

