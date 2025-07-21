const prisma = require('../config/prisma');

// ຟັງຊັນສ້າງ InputCar ໃໝ່
exports.saveInputCar = async (req, res) => {
  try {
    const {
      supplierId,
      expectedDeliveryDate,
      products, // array ຂອງ { carId, quantity }
      orderdById,
      purchaseIds, // array ຂອງ Purchase IDs ທີ່ກ່ຽວຂ້ອງ
      actualCars // array ຂອງລົດຈິງທີ່ໄດ້ຮັບ (ມີເມື່ອ status = RECEIVED)
    } = req.body;

    // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
    if (!orderdById) {
      return res.status(400).json({
        message: "ກະລຸນາລະບຸຜູ້ສ້າງລາຍການນຳເຂົ້າ"
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "ກະລຸນາເລືອກສິນຄ້າທີ່ຕ້ອງການນຳເຂົ້າ"
      });
    }

    // ກວດສອບວ່າ User ມີຢູ່ຈິງຫຼືບໍ່
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(orderdById),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ທີ່ລະບຸ"
      });
    }

    // ກວດສອບວ່າ Supplier ມີຢູ່ຈິງຫຼືບໍ່ (ຖ້າລະບຸ)
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: {
          id: parseInt(supplierId),
        },
      });

      if (!supplier) {
        return res.status(400).json({
          message: "ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງທີ່ລະບຸ"
        });
      }
    }

    // ກວດສອບສິນຄ້າທັງໝົດ
    const carIds = products.map(p => parseInt(p.carId));
    const cars = await prisma.car.findMany({
      where: {
        id: { in: carIds }
      }
    });

    if (cars.length !== carIds.length) {
      return res.status(400).json({
        message: "ມີບາງລົດທີ່ບໍ່ພົບໃນລະບົບ"
      });
    }

    // ກວດສອບ quantity
    for (let product of products) {
      if (!product.quantity || product.quantity <= 0) {
        return res.status(400).json({
          message: "ຈຳນວນສິນຄ້າຕ້ອງມີຄ່າມາກກວ່າ 0"
        });
      }
    }

    // ກວດສອບ Purchase IDs (ຖ້າມີ)
    if (purchaseIds && Array.isArray(purchaseIds) && purchaseIds.length > 0) {
      const purchases = await prisma.purchase.findMany({
        where: {
          id: { in: purchaseIds.map(id => parseInt(id)) },
          status: "CONFIRMED" // ໃບສັ່ງຊື້ຕ້ອງຢືນຢັນແລ້ວ
        }
      });

      if (purchases.length !== purchaseIds.length) {
        return res.status(400).json({
          message: "ມີບາງໃບສັ່ງຊື້ທີ່ບໍ່ພົບຫຼືຍັງບໍ່ໄດ້ຢືນຢັນ"
        });
      }
    }

    // ຄິດໄລ່ຈຳນວນທັງໝົດ
    const quantitytotal = products.reduce((sum, product) => sum + parseInt(product.quantity), 0);

    // ສ້າງ InputCar ພ້ອມ ItemOnIputCar
    const inputCar = await prisma.inputCar.create({
      data: {
        supplierId: supplierId ? parseInt(supplierId) : null,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        quantitytotal: quantitytotal,
        orderdById: parseInt(orderdById),
        status: "PENDING",
        products: {
          create: products.map((product) => ({
            carId: parseInt(product.carId),
            quantity: parseInt(product.quantity),
          })),
        },
        // ເຊື່ອມຕໍ່ກັບ Purchase ຖ້າມີ
        Purches: purchaseIds && purchaseIds.length > 0 ? {
          connect: purchaseIds.map(id => ({ id: parseInt(id) }))
        } : undefined,
      },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
          }
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        products: {
          include: {
            Car: {
              include: {
                brandAndModels: {
                  include: {
                    BrandCars: true
                  }
                },
                colorCar: true,
                typecar: true,
                images: {
                  take: 1,
                }
              }
            }
          }
        },
        Purches: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          }
        }
      },
    });

    res.status(201).json({
      message: "ສ້າງລາຍການນຳເຂົ້າສຳເລັດແລ້ວ",
      data: inputCar,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error saveInputCar in controller!!!",
    });
  }
};

// ຟັງຊັນບັນທຶກລົດຈິງທີ່ໄດ້ຮັບ (ເມື່ອຮັບສິນຄ້າຈິງ)
exports.receiveActualCars = async (req, res) => {
  try {
    const { id } = req.params;
    const { receivedItems } = req.body; // array ຂອງຂໍ້ມູນລົດຈິງ

    // ກວດສອບວ່າລາຍການນຳເຂົ້າມີຢູ່ຫຼືບໍ່
    const inputCar = await prisma.inputCar.findUnique({
      where: { id: Number(id) },
      include: { 
        products: {
          include: {
            Car: true
          }
        }
      }
    });

    if (!inputCar) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນລາຍການນຳເຂົ້າ"
      });
    }

    // ກວດສອບສະຖານະ
    if (inputCar.status !== 'CONFIRMED') {
      return res.status(400).json({
        message: "ລາຍການນຳເຂົ້າຕ້ອງຢືນຢັນກ່ອນຈຶ່ງສາມາດບັນທຶກລົດຈິງໄດ້"
      });
    }

    if (!receivedItems || !Array.isArray(receivedItems) || receivedItems.length === 0) {
      return res.status(400).json({
        message: "ກະລຸນາປ້ອນຂໍ້ມູນລົດທີ່ໄດ້ຮັບຈິງ"
      });
    }

    // ກວດສອບຂໍ້ມູນແຕ່ລະລາຍການ
    for (let item of receivedItems) {
      // ກວດສອບວ່າມີ itemId ທີ່ຕ້ອງການອັບເດດ
      if (!item.itemId) {
        return res.status(400).json({
          message: "ກະລຸນາລະບຸ itemId ສຳລັບແຕ່ລະລາຍການ"
        });
      }

      // ກວດສອບວ່າ item ນີ້ຢູ່ໃນ inputCar ນີ້ຫຼືບໍ່
      const existingItem = inputCar.products.find(p => p.id === parseInt(item.itemId));
      if (!existingItem) {
        return res.status(400).json({
          message: `ບໍ່ພົບ item ID: ${item.itemId} ໃນລາຍການນຳເຂົ້ານີ້`
        });
      }

      // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
      if (!item.receivedQuantity || item.receivedQuantity <= 0) {
        return res.status(400).json({
          message: "ຈຳນວນທີ່ໄດ້ຮັບຕ້ອງມີຄ່າມາກກວ່າ 0"
        });
      }

      // ກວດສອບລາຍລະອຽດລົດຈິງ
      if (!item.actualCars || !Array.isArray(item.actualCars) || item.actualCars.length !== item.receivedQuantity) {
        return res.status(400).json({
          message: `ຈຳນວນລາຍລະອຽດລົດຕ້ອງຕົງກັບຈຳນວນທີ່ໄດ້ຮັບ (${item.receivedQuantity} ຄັນ)`
        });
      }

      // ກວດສອບແຕ່ລະລົດ
      for (let car of item.actualCars) {
        if (!car.name || !car.licensePlate || !car.actualPrice || !car.actualCostPrice) {
          return res.status(400).json({
            message: "ກະລຸນາປ້ອນຂໍ້ມູນລົດໃຫ້ຄົບຖ້ວນ (ຊື່, ປ້າຍທະບຽນ, ລາຄາ)"
          });
        }

        // ກວດສອບປ້າຍທະບຽນຊ້ຳ
        const existingLicensePlate = await prisma.car.findUnique({
          where: { licensePlate: car.licensePlate }
        });

        if (existingLicensePlate) {
          return res.status(400).json({
            message: `ມີປ້າຍທະບຽນ ${car.licensePlate} ຢູ່ແລ້ວໃນລະບົບ`
          });
        }

        // ກວດສອບ VIN ຊ້ຳ (ຖ້າມີ)
        if (car.actualVin) {
          const existingVin = await prisma.car.findUnique({
            where: { vin: car.actualVin }
          });

          if (existingVin) {
            return res.status(400).json({
              message: `ມີເລກ VIN ${car.actualVin} ຢູ່ແລ້ວໃນລະບົບ`
            });
          }
        }
      }
    }

    // ໃຊ້ transaction ເພື່ອບັນທຶກຂໍ້ມູນທັງໝົດ
    const result = await prisma.$transaction(async (prisma) => {
      const createdCars = [];
      const updatedItems = [];

      for (let item of receivedItems) {
        // ສ້າງລົດຈິງແຕ່ລະຄັນ
        for (let carData of item.actualCars) {
          const newCar = await prisma.car.create({
            data: {
              brandAndModelsId: carData.brandAndModelsId ? parseInt(carData.brandAndModelsId) : null,
              name: carData.name.trim(),
              licensePlate: carData.licensePlate.trim(),
              year: carData.actualYear ? parseInt(carData.actualYear) : null,
              colorCarId: carData.colorCarId ? parseInt(carData.colorCarId) : null,
              vin: carData.actualVin ? carData.actualVin.trim() : null,
              engineNumber: carData.actualEngineNumber ? carData.actualEngineNumber.trim() : null,
              typeId: carData.typeId ? parseInt(carData.typeId) : null,
              status: "Available",
              price: parseFloat(carData.actualPrice),
              costPrice: parseFloat(carData.actualCostPrice),
              description: carData.actualDescription || null,
              brandCarsId: carData.brandCarsId ? parseInt(carData.brandCarsId) : null,
              // ບັນທຶກຮູບພາບຖ້າມີ
              images: carData.images && carData.images.length > 0 ? {
                create: carData.images.map((img) => ({
                  asset_id: img.asset_id,
                  public_id: img.public_id,
                  url: img.url,
                  secure_url: img.secure_url,
                })),
              } : undefined,
              imaged: carData.imaged && carData.imaged.length > 0 ? {
                create: carData.imaged.map((img) => ({
                  asset_id: img.asset_id,
                  public_id: img.public_id,
                  url: img.url,
                  secure_url: img.secure_url,
                })),
              } : undefined,
            }
          });

          createdCars.push(newCar);
        }

        // ອັບເດດ ItemOnIputCar ດ້ວຍຂໍ້ມູນລົດຈິງ
        const firstActualCar = createdCars[createdCars.length - item.actualCars.length]; // ລົດທຳອິດຂອງ item ນີ້
        const firstCarData = item.actualCars[0]; // ຂໍ້ມູນລົດທຳອິດ

        const updatedItem = await prisma.itemOnIputCar.update({
          where: { id: parseInt(item.itemId) },
          data: {
            receivedQuantity: parseInt(item.receivedQuantity),
            actualCarId: firstActualCar.id, // ເຊື່ອມກັບລົດທຳອິດ
            actualVin: firstCarData.actualVin || null,
            actualLicensePlate: firstCarData.licensePlate,
            actualYear: firstCarData.actualYear ? parseInt(firstCarData.actualYear) : null,
            actualPrice: parseFloat(firstCarData.actualPrice),
            actualCostPrice: parseFloat(firstCarData.actualCostPrice),
            actualEngineNumber: firstCarData.actualEngineNumber || null,
            actualDescription: firstCarData.actualDescription || null,
            actualColorName: firstCarData.actualColorName || null,
            actualBrandModel: firstCarData.actualBrandModel || null,
            actualTypeName: firstCarData.actualTypeName || null,
            notes: item.notes || null,
            receivedDate: new Date(),
            updatedAt: new Date()
          }
        });

        updatedItems.push(updatedItem);
      }

      // ອັບເດດສະຖານະ InputCar ເປັນ RECEIVED
      const updatedInputCar = await prisma.inputCar.update({
        where: { id: Number(id) },
        data: {
          status: 'RECEIVED',
          updatedAt: new Date()
        }
      });

      return { createdCars, updatedItems, updatedInputCar };
    });

    res.json({
      message: `ບັນທຶກລົດຈິງສຳເລັດແລ້ວ (${result.createdCars.length} ຄັນ)`,
      data: {
        inputCar: result.updatedInputCar,
        receivedCars: result.createdCars,
        updatedItems: result.updatedItems,
        summary: {
          totalCarsReceived: result.createdCars.length,
          itemsUpdated: result.updatedItems.length
        }
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error receiveActualCars in controller!!!",
    });
  }
};

// ຟັງຊັນອ່ານລາຍການນຳເຂົ້າທັງໝົດ
exports.listInputCars = async (req, res) => {
  try {
    const { status, supplierId, orderdById } = req.query;
    
    // ສ້າງເງື່ອນໄຂການຄົ້ນຫາ
    let whereCondition = {};
    
    if (status) {
      whereCondition.status = status;
    }
    
    if (supplierId) {
      whereCondition.supplierId = parseInt(supplierId);
    }
    
    if (orderdById) {
      whereCondition.orderdById = parseInt(orderdById);
    }

    const inputCars = await prisma.inputCar.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
          }
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        products: {
          include: {
            Car: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
                price: true,
                costPrice: true,
              }
            }
          }
        },
        Purches: {
          select: {
            id: true,
            status: true,
            quantitytotal: true,
          }
        },
        _count: {
          select: {
            products: true,
            Purches: true,
          }
        }
      },
    });
    
    res.json({
      message: "ດຶງຂໍ້ມູນລາຍການນຳເຂົ້າສຳເລັດແລ້ວ",
      data: inputCars
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      message: "Server error listInputCars in controller!!!" 
    });
  }
};

// ຟັງຊັນອ່ານລາຍການນຳເຂົ້າແຕ່ລະລາຍການ
exports.readInputCar = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inputCar = await prisma.inputCar.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
            address: true,
          }
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
                position: true,
              }
            }
          }
        },
        products: {
          include: {
            Car: {
              include: {
                brandAndModels: {
                  include: {
                    BrandCars: true
                  }
                },
                colorCar: true,
                typecar: true,
                images: true,
              }
            }
          }
        },
        Purches: {
          include: {
            products: {
              include: {
                Car: {
                  select: {
                    name: true,
                    licensePlate: true,
                  }
                }
              }
            }
          }
        }
      },
    });
    
    if (!inputCar) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນລາຍການນຳເຂົ້າ"
      });
    }
    
    res.json({
      message: "ດຶງຂໍ້ມູນລາຍການນຳເຂົ້າສຳເລັດແລ້ວ",
      data: inputCar
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      message: "Server error readInputCar in controller!!!" 
    });
  }
};

// ຟັງຊັນອັບເດດລາຍການນຳເຂົ້າ
exports.updateInputCar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      expectedDeliveryDate,
      supplierId,
      products
    } = req.body;

    // ກວດສອບວ່າລາຍການນຳເຂົ້າມີຢູ່ຫຼືບໍ່
    const existingInputCar = await prisma.inputCar.findUnique({
      where: { id: Number(id) },
      include: { products: true }
    });

    if (!existingInputCar) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນລາຍການນຳເຂົ້າ"
      });
    }

    // ກວດສອບສະຖານະທີ່ອະນຸຍາດ
    const allowedStatuses = ['PENDING', 'CONFIRMED', 'RECEIVED', 'CANCELLED'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "ສະຖານະບໍ່ຖືກຕ້ອງ"
      });
    }

    // ຖ້າສະຖານະເປັນ RECEIVED ຫຼື CANCELLED ແລ້ວ ບໍ່ສາມາດແກ້ໄຂໄດ້
    if (['RECEIVED', 'CANCELLED'].includes(existingInputCar.status)) {
      return res.status(400).json({
        message: "ບໍ່ສາມາດແກ້ໄຂລາຍການນຳເຂົ້າທີ່ໄດ້ຮັບຫຼືຍົກເລີກແລ້ວ"
      });
    }

    // ກວດສອບ Supplier (ຖ້າມີການແກ້ໄຂ)
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: parseInt(supplierId) }
      });
      
      if (!supplier) {
        return res.status(400).json({
          message: "ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງທີ່ລະບຸ"
        });
      }
    }

    // ເຕຣຽມຂໍ້ມູນສຳລັບອັບເດດ
    let updateData = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (expectedDeliveryDate !== undefined) {
      updateData.expectedDeliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate) : null;
    }
    if (supplierId !== undefined) {
      updateData.supplierId = supplierId ? parseInt(supplierId) : null;
    }

    // ຖ້າມີການແກ້ໄຂສິນຄ້າ
    if (products && Array.isArray(products)) {
      // ກວດສອບສິນຄ້າທັງໝົດ
      const carIds = products.map(p => parseInt(p.carId));
      const cars = await prisma.car.findMany({
        where: { id: { in: carIds } }
      });

      if (cars.length !== carIds.length) {
        return res.status(400).json({
          message: "ມີບາງລົດທີ່ບໍ່ພົບໃນລະບົບ"
        });
      }

      // ຄິດໄລ່ຈຳນວນໃໝ່
      const quantitytotal = products.reduce((sum, product) => sum + parseInt(product.quantity), 0);
      updateData.quantitytotal = quantitytotal;

      // ລົບ ItemOnIputCar ເກົ່າ ແລະສ້າງໃໝ່
      await prisma.itemOnIputCar.deleteMany({
        where: { inputCarId: Number(id) }
      });

      updateData.products = {
        create: products.map((product) => ({
          carId: parseInt(product.carId),
          quantity: parseInt(product.quantity),
        })),
      };
    }

    // ອັບເດດລາຍການນຳເຂົ້າ
    const updatedInputCar = await prisma.inputCar.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
          }
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        products: {
          include: {
            Car: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
                price: true,
                costPrice: true,
              }
            }
          }
        },
      },
    });

    res.json({
      message: "ອັບເດດລາຍການນຳເຂົ້າສຳເລັດແລ້ວ",
      data: updatedInputCar,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error updateInputCar in controller!!!",
    });
  }
};

// ຟັງຊັນລົບລາຍການນຳເຂົ້າ
exports.removeInputCar = async (req, res) => {
  try {
    const { id } = req.params;

    // ກວດສອບວ່າລາຍການນຳເຂົ້າມີຢູ່ຫຼືບໍ່
    const existingInputCar = await prisma.inputCar.findUnique({
      where: { id: Number(id) },
      include: { 
        products: true,
        Purches: true,
      }
    });

    if (!existingInputCar) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນລາຍການນຳເຂົ້າ"
      });
    }

    // ກວດສອບສະຖານະ - ບໍ່ສາມາດລົບລາຍການທີ່ CONFIRMED ຫຼື RECEIVED
    if (['CONFIRMED', 'RECEIVED'].includes(existingInputCar.status)) {
      return res.status(400).json({
        message: "ບໍ່ສາມາດລົບລາຍການນຳເຂົ້າທີ່ຢືນຢັນຫຼືໄດ້ຮັບແລ້ວ"
      });
    }

    // ລົບລາຍການນຳເຂົ້າ (ItemOnIputCar ຈະຖືກລົບອັດຕະໂນມັດດ້ວຍ Cascade)
    const deletedInputCar = await prisma.inputCar.delete({
      where: { id: Number(id) }
    });

    res.json({
      message: "ລົບລາຍການນຳເຂົ້າສຳເລັດແລ້ວ",
      data: {
        id: deletedInputCar.id,
        status: deletedInputCar.status,
        quantitytotal: deletedInputCar.quantitytotal,
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error removeInputCar in controller!!!",
    });
  }
};

// ຟັງຊັນຄົ້ນຫາລາຍການນຳເຂົ້າ
exports.searchInputCars = async (req, res) => {
  try {
    const { query, status, supplierId, dateFrom, dateTo } = req.body;
    
    let whereCondition = {};
    
    // ຖ້າມີການຄົ້ນຫາດ້ວຍຂໍ້ຄວາມ
    if (query && query.trim() !== "") {
      whereCondition.OR = [
        {
          supplier: {
            companyName: {
              contains: query.trim(),
            },
          },
        },
        {
          orderdBy: {
            username: {
              contains: query.trim(),
            },
          },
        },
        {
          orderdBy: {
            employee: {
              firstName: {
                contains: query.trim(),
              },
            },
          },
        },
        {
          products: {
            some: {
              Car: {
                name: {
                  contains: query.trim(),
                },
              },
            },
          },
        },
      ];
    }
    
    // ກັ່ນຕອງຕາມສະຖານະ
    if (status) {
      whereCondition.status = status;
    }
    
    // ກັ່ນຕອງຕາມຜູ້ສະໜອງ
    if (supplierId) {
      whereCondition.supplierId = parseInt(supplierId);
    }
    
    // ກັ່ນຕອງຕາມວັນທີ
    if (dateFrom || dateTo) {
      whereCondition.createdAt = {};
      if (dateFrom) {
        whereCondition.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereCondition.createdAt.lte = new Date(dateTo);
      }
    }

    const inputCars = await prisma.inputCar.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          }
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        products: {
          include: {
            Car: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
                price: true,
              }
            }
          }
        },
        _count: {
          select: {
            products: true,
            Purches: true,
          }
        }
      },
    });

    res.json({
      message: "ຄົ້ນຫາລາຍການນຳເຂົ້າສຳເລັດແລ້ວ",
      data: inputCars
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error searchInputCars in controller!!!",
    });
  }
};

// ຟັງຊັນປ່ຽນສະຖານະລາຍການນຳເຂົ້າ
exports.updateInputCarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ກວດສອບສະຖານະທີ່ອະນຸຍາດ
    const allowedStatuses = ['PENDING', 'CONFIRMED', 'RECEIVED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "ສະຖານະບໍ່ຖືກຕ້ອງ"
      });
    }

    // ກວດສອບວ່າລາຍການນຳເຂົ້າມີຢູ່ຫຼືບໍ່
    const existingInputCar = await prisma.inputCar.findUnique({
      where: { id: Number(id) }
    });

    if (!existingInputCar) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນລາຍການນຳເຂົ້າ"
      });
    }

    // ກວດສອບການປ່ຽນສະຖານະທີ່ອະນຸຍາດ
    const statusFlow = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['RECEIVED', 'CANCELLED'],
      'RECEIVED': [], // ບໍ່ສາມາດປ່ຽນຫາສະຖານະອື່ນໄດ້
      'CANCELLED': [] // ບໍ່ສາມາດປ່ຽນຫາສະຖານະອື່ນໄດ້
    };

    if (!statusFlow[existingInputCar.status].includes(status)) {
      return res.status(400).json({
        message: `ບໍ່ສາມາດປ່ຽນສະຖານະຈາກ ${existingInputCar.status} ເປັນ ${status} ໄດ້`
      });
    }

    // ຖ້າປ່ຽນເປັນ RECEIVED ຕ້ອງມີການບັນທຶກລົດຈິງກ່ອນ
    if (status === 'RECEIVED') {
      return res.status(400).json({
        message: "ກະລຸນາໃຊ້ API receiveActualCars ເພື່ອບັນທຶກລົດຈິງທີ່ໄດ້ຮັບ"
      });
    }

    // ອັບເດດສະຖານະ
    const updatedInputCar = await prisma.inputCar.update({
      where: { id: Number(id) },
      data: { 
        status: status,
        updatedAt: new Date()
      },
      include: {
        supplier: {
          select: {
            companyName: true,
          }
        },
        products: {
          include: {
            Car: {
              select: {
                name: true,
                licensePlate: true,
              }
            }
          }
        },
      },
    });

    res.json({
      message: `ປ່ຽນສະຖານະລາຍການນຳເຂົ້າເປັນ ${status} ສຳເລັດແລ້ວ`,
      data: updatedInputCar,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error updateInputCarStatus in controller!!!",
    });
  }
};