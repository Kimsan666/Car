const prisma = require("../config/prisma");

exports.saveBrandAndModel = async (req, res) => {
  try {
    const { modelCar, brandCarsId } = req.body;

    // ກວດສອບວ່າໃນ Brand ນີ້ມີ Model ຊື່ເໝືອນກັນຢູ່ແລ້ວຫຼືບໍ່
    const existingModel = await prisma.brandAndModels.findFirst({
      where: {
        modelCar: modelCar,
        brandCarsId: parseInt(brandCarsId),
      },
      include: {
        BrandCars: true, // ດຶງຂໍ້ມູນ Brand ມາພ້ອມກັນ
      },
    });

    if (existingModel) {
      return res.status(400).json({
        message: `ມີລຸ້ນ "${modelCar}" ໃນແບຣນ "${existingModel.BrandCars.name}" ແລ້ວ`,
        existing: existingModel,
      });
    }

    // ກວດສອບວ່າ Brand ມີຢູ່ຈິງຫຼືບໍ່
    const brandExists = await prisma.brandCars.findUnique({
      where: {
        id: parseInt(brandCarsId),
      },
    });

    if (!brandExists) {
      return res.status(400).json({
        message: "ບໍ່ພົບແບຣນທີ່ລະບຸ",
      });
    }

    // ສ້າງ Brand Model ໃໝ່
    const brandAndModels = await prisma.brandAndModels.create({
      data: {
        modelCar: modelCar,
        brandCarsId: parseInt(brandCarsId),
      },
      include: {
        BrandCars: true, // ສົ່ງກັບຂໍ້ມູນ Brand ມາພ້ອມກັນ
      },
    });

    res.status(201).json({
      message: "ສ້າງລຸ້ນໃໝ່ສຳເລັດແລ້ວ",
      data: brandAndModels,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error savebrandAndModels in BrandAndModel!!!",
    });
  }
};

exports.listBrandAndModel = async (req, res) => {
  try {
    const Brand = await prisma.brandAndModels.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        BrandCars: true, // ສົ່ງກັບຂໍ້ມູນ Brand ມາພ້ອມກັນ
      },
    });
    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error list Brand" });
  }
};
exports.readBrandAndModel  = async (req, res) => {
  try {
    const { id } = req.params;
    const Brand = await prisma.brandAndModels.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        BrandCars: true, // ສົ່ງກັບຂໍ້ມູນ Brand ມາພ້ອມກັນ
      },
    });
    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error read brandAndModels" });
  }
};
exports.updateBrandAndModel = async (req, res) => {
  try {
    const { modelCar, brandCarsId } = req.body; // ປ່ຽນຈາກ name ເປັນ modelCar
    const brandandmodelId = Number(req.params.id);

    if (!modelCar || !brandCarsId) {
      return res.status(400).json({ 
        message: "modelCar ແລະ brandCarsId ຈໍາເປັນຕ້ອງມີ" 
      });
    }

    // ກວດສອບວ່າຢູ່ໃນ Brand ດຽວກັນນີ້ມີ Model ຊື່ເຫມືອນກັນຢູ່ແລ້ວຫຼືບໍ່ (ຍົກເວັ້ນຕົວເອງ)
    const existingModel = await prisma.brandAndModels.findFirst({
      where: {
        modelCar: modelCar,
        brandCarsId: parseInt(brandCarsId), // ເພີ່ມເງື່ອນໄຂນີ້ເພື່ອກວດສອບໃນ Brand ດຽວກັນ
        NOT: {
          id: brandandmodelId, // ຍົກເວັ້ນຕົວເອງ
        },
      },
      include: {
        BrandCars: true, // ດຶງຂໍ້ມູນ Brand ມາພ້ອມກັນ
      },
    });

    if (existingModel) {
      return res.status(400).json({
        message: `ມີລຸ້ນ "${modelCar}" ໃນແບຣນ "${existingModel.BrandCars.name}" ແລ້ວ`,
        existing: existingModel,
      });
    }

    // ກວດສອບວ່າ Brand ມີຢູ່ຈິງຫຼືບໍ່
    const brandExists = await prisma.brandCars.findUnique({
      where: {
        id: parseInt(brandCarsId),
      },
    });

    if (!brandExists) {
      return res.status(400).json({
        message: "ບໍ່ພົບແບຣນທີ່ລະບຸ",
      });
    }

    // ກວດສອບວ່າ record ທີ່ຈະແກ້ໄຂມີຢູ່ຈິງຫຼືບໍ່
    const currentRecord = await prisma.brandAndModels.findUnique({
      where: {
        id: brandandmodelId,
      },
    });

    if (!currentRecord) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນທີ່ຈະແກ້ໄຂ",
      });
    }

    // ອັບເດດຂໍ້ມູນ
    const updatedBrand = await prisma.brandAndModels.update({
      where: {
        id: brandandmodelId,
      },
      data: {
        brandCarsId: parseInt(brandCarsId),
        modelCar: modelCar,
        updatedAt: new Date(),
      },
      include: {
        BrandCars: true, // ສົ່ງຂໍ້ມູນ Brand ກັບຄືນມາພ້ອມກັນ
      },
    });

    res.json({
      message: "ອັບເດດລຸ້ນສຳເລັດແລ້ວ",
      data: updatedBrand,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error update brandAndModel" });
  }
};

exports.deleteBrandAndModel = async (req, res) => {
  try {
    const { id } = req.params;
    const brandandmodelId = Number(id);

    const brand = await prisma.brandAndModels.findUnique({
      where: { id: brandandmodelId },
    });

    if (!brand) {
      return res.status(404).json({ message: "ບໍ່ພົບລຸ້ນນີ້" });
    }

    const relatedcars= await prisma.car.findMany({
      where: {
        brandAndModelsId: brandandmodelId,
      },
    });



    if (relatedcars.length > 0) {
      return res.status(400).json({
        message: `ບໍ່ສາມາດລົບລຸ້ນ "${brand.name}" ໄດ້ ເນື່ອງຈາກຍັງມີສິນຄ້າໃນ car ໃຊ້ຢູ່`,
      });
    }

    const deletedBrand = await prisma.brandAndModels.delete({
      where: { id: brandandmodelId },
    });

    res.json({ message: `ລົບສຳເລັດ` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error delete Brand" });
  }
};