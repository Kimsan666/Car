const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUND_NAME,
  api_key: process.env.CLOUDINARY_AIP_KEY,
  api_secret: process.env.CLOUDINARY_AIP_SECRET,
});

exports.saveCar = async (req, res) => {
  try {
    const {
      brandAndModelsId,
      name,
      licensePlate,
      year,
      colorCarId,
      vin,
      engineNumber,
      typeId,
      status,
      price,
      costPrice,
      description,
      brandCarsId,
      images,
      imaged,
    } = req.body;

    // ກວດສອບວ່າມີ licensePlate ຊ້ຳກັນຫຼືບໍ່
    const existingLicensePlate = await prisma.car.findUnique({
      where: {
        licensePlate: licensePlate,
      },
    });

    if (existingLicensePlate) {
      return res.status(400).json({
        message: "ມີປ້າຍທະບຽນລົດນີ້ຢູ່ແລ້ວ",
      });
    }

    // ກວດສອບວ່າມີ VIN ຊ້ຳກັນຫຼືບໍ່ (ຖ້າມີ)
    if (vin) {
      const existingVin = await prisma.car.findUnique({
        where: {
          vin: vin,
        },
      });

      if (existingVin) {
        return res.status(400).json({
          message: "ມີເລກ VIN ນີ້ຢູ່ແລ້ວ",
        });
      }
    }

    // ກວດສອບວ່າ Brand and Model ມີຢູ່ຈິງຫຼືບໍ່
    if (brandAndModelsId) {
      const brandModel = await prisma.brandAndModels.findUnique({
        where: {
          id: parseInt(brandAndModelsId),
        },
      });

      if (!brandModel) {
        return res.status(400).json({
          message: "ບໍ່ພົບຂໍ້ມູນແບຣນແລະລຸ້ນທີ່ລະບຸ",
        });
      }
    }

    // ກວດສອບວ່າ Color ມີຢູ່ຈິງຫຼືບໍ່
    if (colorCarId) {
      const color = await prisma.colorCar.findUnique({
        where: {
          id: parseInt(colorCarId),
        },
      });

      if (!color) {
        return res.status(400).json({
          message: "ບໍ່ພົບສີລົດທີ່ລະບຸ",
        });
      }
    }

    // ກວດສອບວ່າ Type ມີຢູ່ຈິງຫຼືບໍ່
    if (typeId) {
      const type = await prisma.typeCar.findUnique({
        where: {
          id: parseInt(typeId),
        },
      });

      if (!type) {
        return res.status(400).json({
          message: "ບໍ່ພົບປະເພດລົດທີ່ລະບຸ",
        });
      }
    }

    // ກວດສອບວ່າ Brand ມີຢູ່ຈິງຫຼືບໍ່
    if (brandCarsId) {
      const brand = await prisma.brandCars.findUnique({
        where: {
          id: parseInt(brandCarsId),
        },
      });

      if (!brand) {
        return res.status(400).json({
          message: "ບໍ່ພົບແບຣນລົດທີ່ລະບຸ",
        });
      }
    }

    // ສ້າງຂໍ້ມູນລົດພ້ອມຮູບພາບ
    const car = await prisma.car.create({
      data: {
        brandAndModelsId: brandAndModelsId ? parseInt(brandAndModelsId) : null,
        name: name,
        licensePlate: licensePlate,
        year: year ? parseInt(year) : null,
        colorCarId: colorCarId ? parseInt(colorCarId) : null,
        vin: vin || null,
        engineNumber: engineNumber || null,
        typeId: typeId ? parseInt(typeId) : null,
        status: status || "Available",
        price: parseFloat(price),
        costPrice: parseFloat(costPrice),
        description: description || null,
        brandCarsId: brandCarsId ? parseInt(brandCarsId) : null,
        // ບັນທຶກຮູບພາບໃນຕາຕະລາງ Image
        images:
          images && images.length > 0
            ? {
                create: images.map((item) => ({
                  asset_id: item.asset_id,
                  public_id: item.public_id,
                  url: item.url,
                  secure_url: item.secure_url,
                })),
              }
            : undefined,
        // ບັນທຶກຮູບພາບໃນຕາຕະລາງ Imaged
        imaged:
          imaged && imaged.length > 0
            ? {
                create: imaged.map((item) => ({
                  asset_id: item.asset_id,
                  public_id: item.public_id,
                  url: item.url,
                  secure_url: item.secure_url,
                })),
              }
            : undefined,
      },
      include: {
        brandAndModels: {
          include: {
            BrandCars: true,
          },
        },
        colorCar: true,
        typecar: true,
        brandCars: true,
        images: true,
        imaged: true,
      },
    });

    res.status(201).json({
      message: "ບັນທຶກຂໍ້ມູນລົດສຳເລັດແລ້ວ",
      data: car,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error saveCar in controller!!!",
    });
  }
};

exports.listCar = async (req, res) => {
  try {
    const car = await prisma.car.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        brandCars: {
          select: {
            name: true,
          },
        },
        colorCar: {
          select: {
            name: true,
          },
        },
        typecar: {
          select: {
            name: true,
          },
        },
        brandAndModels: {
          select: {
            modelCar: true,
          },
        },
        images: true,
        imaged: true,
      },
    });
    res.json(car);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error list car" });
  }
};

exports.readCar = async (req, res) => {
  try {
    const { id } = req.params;
    const carId = Number(id);
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນລົດນີ້" });
    }

    const products = await prisma.car.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        brandCars: true,
        colorCar: true,
        typecar: true,
        brandAndModels: true,
        images: true,
        imaged: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error readCar in controller!!!" });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const {
      brandAndModelsId,
      name,
      licensePlate,
      year,
      colorCarId,
      vin,
      engineNumber,
      typeId,
      status,
      price,
      costPrice,
      description,
      brandCarsId,
      images,
      imaged,
    } = req.body;
    const { id } = req.params;
    // code
    // ກວດສອບວ່າມີ licensePlate ຊ້ຳກັນຫຼືບໍ່
    const existingLicensePlate = await prisma.car.findUnique({
      where: {
        licensePlate: licensePlate,
        NOT: {
          id: Number(id),
        },
      },
    });

    if (existingLicensePlate) {
      return res.status(400).json({
        message: "ມີປ້າຍທະບຽນລົດນີ້ຢູ່ແລ້ວ",
      });
    }

    // ກວດສອບວ່າມີ VIN ຊ້ຳກັນຫຼືບໍ່ (ຖ້າມີ)
    if (vin) {
      const existingVin = await prisma.car.findUnique({
        where: {
          vin: vin,
          NOT: {
            id: Number(id),
          },
        },
      });

      if (existingVin) {
        return res.status(400).json({
          message: "ມີເລກ VIN ນີ້ຢູ່ແລ້ວ",
        });
      }
    }

    // ກວດສອບວ່າ Brand and Model ມີຢູ່ຈິງຫຼືບໍ່
    if (brandAndModelsId) {
      const brandModel = await prisma.brandAndModels.findUnique({
        where: {
          id: parseInt(brandAndModelsId),
        },
      });

      if (!brandModel) {
        return res.status(400).json({
          message: "ບໍ່ພົບຂໍ້ມູນແບຣນແລະລຸ້ນທີ່ລະບຸ",
        });
      }
    }

    // ກວດສອບວ່າ Color ມີຢູ່ຈິງຫຼືບໍ່
    if (colorCarId) {
      const color = await prisma.colorCar.findUnique({
        where: {
          id: parseInt(colorCarId),
        },
      });

      if (!color) {
        return res.status(400).json({
          message: "ບໍ່ພົບສີລົດທີ່ລະບຸ",
        });
      }
    }

    // ກວດສອບວ່າ Type ມີຢູ່ຈິງຫຼືບໍ່
    if (typeId) {
      const type = await prisma.typeCar.findUnique({
        where: {
          id: parseInt(typeId),
        },
      });

      if (!type) {
        return res.status(400).json({
          message: "ບໍ່ພົບປະເພດລົດທີ່ລະບຸ",
        });
      }
    }

    // ກວດສອບວ່າ Brand ມີຢູ່ຈິງຫຼືບໍ່
    if (brandCarsId) {
      const brand = await prisma.brandCars.findUnique({
        where: {
          id: parseInt(brandCarsId),
        },
      });

      if (!brand) {
        return res.status(400).json({
          message: "ບໍ່ພົບແບຣນລົດທີ່ລະບຸ",
        });
      }
    }

    await prisma.image.deleteMany({
      where: {
        carId: Number(req.params.id),
      },
    });
    await prisma.imaged.deleteMany({
      where: {
        carId: Number(req.params.id),
      },
    });

    const car = await prisma.car.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        brandAndModelsId: brandAndModelsId ? parseInt(brandAndModelsId) : null,
        name: name,
        licensePlate: licensePlate,
        year: year ? parseInt(year) : null,
        colorCarId: colorCarId ? parseInt(colorCarId) : null,
        vin: vin || null,
        engineNumber: engineNumber || null,
        typeId: typeId ? parseInt(typeId) : null,
        status: status || "Available",
        price: parseFloat(price),
        costPrice: parseFloat(costPrice),
        description: description || null,
        brandCarsId: brandCarsId ? parseInt(brandCarsId) : null,
        // ບັນທຶກຮູບພາບໃນຕາຕະລາງ Image
        images:
          images && images.length > 0
            ? {
                create: images.map((item) => ({
                  asset_id: item.asset_id,
                  public_id: item.public_id,
                  url: item.url,
                  secure_url: item.secure_url,
                })),
              }
            : undefined,
        // ບັນທຶກຮູບພາບໃນຕາຕະລາງ Imaged
        imaged:
          imaged && imaged.length > 0
            ? {
                create: imaged.map((item) => ({
                  asset_id: item.asset_id,
                  public_id: item.public_id,
                  url: item.url,
                  secure_url: item.secure_url,
                })),
              }
            : undefined,
      },
      include: {
        brandAndModels: {
          include: {
            BrandCars: true,
          },
        },
        colorCar: true,
        typecar: true,
        brandCars: true,
        images: true,
        imaged: true,
      },
    });
    res.send("Update Success");
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Server error updateProduct in controller!!!" });
  }
};

exports.removeCar = async (req, res) => {
  try {
    const { id } = req.params;

    // ໃຊ້ transaction ເພື່ອໃຫ້ແນ່ໃຈວ່າການລົບເຮັດວຽກຢ່າງປອດໄພ
    const result = await prisma.$transaction(async (prisma) => {
      // ຄົ້ນຫາລົດ Include ຂໍ້ມູນທີ່ກ່ຽວຂ້ອງ
      const car = await prisma.car.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          images: true,
          imaged: true,
          brandAndModels: true,
          colorCar: true,
          brandCars: true,
          typecar: true,
          // ກວດສອບຂໍ້ມູນທີ່ເຊື່ອມຕໍ່ກັບລົດ
          Order: true,
          supplierProducts: true,
          itemonPurches: true,
          itemonInputcar: true,
        },
      });

      if (!car) {
        throw new Error("ບໍ່ພົບລົດທີ່ຕ້ອງການລົບ");
      }

      // ກວດສອບວ່າລົດຍັງຖືກໃຊ້ຢູ່ໃນຕາຕະລາງອື່ນຫຼືບໍ່
      if (car.Order.length > 0) {
        throw new Error("ບໍ່ສາມາດລົບລົດໄດ້ເພາະມີການສັ່ງຊື້ແລ້ວ");
      }

      if (car.supplierProducts.length > 0) {
        throw new Error("ບໍ່ສາມາດລົບລົດໄດ້ເພາະຍັງເຊື່ອມຕໍ່ກັບຜູ້ສະໜອງ");
      }

      if (car.itemonPurches.length > 0) {
        throw new Error("ບໍ່ສາມາດລົບລົດໄດ້ເພາະຍັງມີໃນໃບສັ່ງຊື້");
      }

      if (car.itemonInputcar.length > 0) {
        throw new Error("ບໍ່ສາມາດລົບລົດໄດ້ເພາະຍັງມີໃນລາຍການນຳເຂົ້າ");
      }

      // ລົບຮູບພາບໃນ Cloudinary
      const deleteImagePromises = car.images.map(
        (image) =>
          new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(image.public_id, (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            });
          })
      );

      const deleteImagedPromises = car.imaged.map(
        (image) =>
          new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(image.public_id, (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            });
          })
      );

      // ລໍຖ້າໃຫ້ການລົບຮູບພາບເສັດສິ້ນ
      await Promise.all([...deleteImagePromises, ...deleteImagedPromises]);

      // ລົບຮູບພາບໃນຖານຂໍ້ມູນ (Cascade ຈະເຮັດອັດຕະໂນມັດ ແຕ່ເຮົາຈະລົບໃສ່ເອງເພື່ອຄວາມແນ່ໃຈ)
      await prisma.image.deleteMany({
        where: {
          carId: Number(id),
        },
      });

      await prisma.imaged.deleteMany({
        where: {
          carId: Number(id),
        },
      });

      // ລົບລົດ
      const deletedCar = await prisma.car.delete({
        where: {
          id: Number(id),
        },
      });

      return deletedCar;
    });

    res.json({
      success: true,
      message: "ລົບລົດສຳເລັດແລ້ວ",
      data: result,
    });
  } catch (err) {
    console.log(err);

    // ກວດສອບ error message ເພື່ອສົ່ງ response ທີ່ເໝາະສົມ
    if (
      err.message.includes("ບໍ່ພົບລົດ") ||
      err.message.includes("ບໍ່ສາມາດລົບລົດໄດ້")
    ) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error removeCar in controller!!!",
      error: err.message,
    });
  }
};

// exports.listbyProduct = async (req, res) => {
//   try {
//     const { sort, order, limit } = req.body;
//     console.log(sort, order, limit);
//     const products = await prisma.product.findMany({
//       take: limit,
//       orderBy: { [sort]: order },
//       include: {
//         images: true,
//         imaged: true,
//       },
//     });
//     res.send(products);
//   } catch (err) {
//     console.log(err);
//     res
//       .status(500)
//       .json({ message: "Server error listbyProduct in controller!!!" });
//   }
// };

// const handleQuery = async (req, res, query) => {
//   try {
//     const products = await prisma.warehouseStock.findMany({
//       where: {
//         product: {
//           name: {
//             contains: query,
//           },
//         },
//       },
//       include: {
//         product: {
//           include: {
//             images: true,
//             imaged: true,
//           },
//         },
//       },
//     });
//     res.send(products);
//   } catch (err) {
//     console.log(err);
//     res
//       .status(500)
//       .json({ message: "Server error Search handleQuery in controller!!!" });
//   }
// };

// const handleSuppiler = async (req, res, supplierId) => {
//   try {
//     const products = await prisma.product.findMany({
//       where: {
//         supplierId: {
//           in: supplierId.map((id) => Number(id)),
//         },
//       },
//       include: {
//         supplier: true,
//         images: true,
//       },
//     });
//     res.send(products);
//   } catch (err) {
//     console.log(err);
//     res
//       .status(500)
//       .json({ message: "Server error Search handleQuery in controller!!!" });
//   }
// };
// // controllers/ProductController.js

// exports.searchfiltersProduct = async (req, res) => {
//   try {
//     const { query, unit, supplier } = req.body;

//     if (query && query.trim() !== "") {
//       console.log("query -->", query);
//       return await handleQuery(req, res, query);
//     }

//     // ถ้าไม่มี query ให้คืนสินค้าทั้งหมด
//     const products = await prisma.warehouseStock.findMany({
//       include: {
//         product: {
//           include: {
//             images: true,
//             imaged: true,
//           },
//         },
//       },
//     });

//     return res.send(products);
//   } catch (err) {
//     console.log(err);
//     res
//       .status(500)
//       .json({ message: "Server error in searchfiltersProduct!!!" });
//   }
// };

exports.UploadImages = async (req, res) => {
  try {
    console.log(req.body);
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `JIMCOM-${Date.now()}`,
      resource_type: "auto",
      folder: "PRODUCT_WAREHOUSE",
    });
    res.send(result);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Server error UploadImages in controller!!!" });
  }
};
exports.RemoveImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    cloudinary.uploader.destroy(public_id, (result) => {
      res.send("Remove Image Success!!!");
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Server error RemoveImage in controller!!!" });
  }
};
exports.UploadImaged = async (req, res) => {
  try {
    console.log(req.body);
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `JIMCOM-${Date.now()}`,
      resource_type: "auto",
      folder: "PRODUCT_WAREHOUSE_Detail",
    });
    res.send(result);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Server error UploadImages in controller!!!" });
  }
};
