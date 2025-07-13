// src/constants/menuGroups.js
import {
  LayoutDashboard,
  PackageSearch,
  Warehouse,
  CalendarArrowDown,
  UserRoundPen,
  Boxes,
  Combine,
  Container,
  Package,
  ArchiveRestore,
  PackagePlus,
  Shredder,
  Ambulance,
  PanelTopOpen,
  CircleUserRound,
  SquareUser,
  ShoppingBag ,
} from "lucide-react";

const MenuAdminDropdown = [
  {
    name: "ຈັດການຂໍ້ມູນສິນຄ້າ",
    icon: <PackageSearch />,
    sub: [
      { name: "ສິນຄ້າ", icon: <PackageSearch />, path: "/admin/product" },
      { name: "ປະເພດສິນຄ້າ", icon: <Boxes />, path: "/admin/category" },
      { name: "ຫົວໜ່ວຍສິນຄ້າ", icon: <Combine />, path: "/admin/Unit" },
      { name: "ຜູ້ສະໜອງ", icon: <Container />, path: "/admin/supplier" },
      { name: "ສາງສິນຄ້າ", icon: <Warehouse />, path: "/admin/warehouse" },
      { name: "ສະຕອກສິນຄ້າ", icon: <Package />, path: "/admin/warehousestock" },
      { name: "ພະນັກງານ", icon: <SquareUser />, path: "/admin/employee" },
      {
        name: "ຜູ້ໃໍຊ້ລະບົບ",
        icon: <CircleUserRound />,
        path: "/admin/datauser",
      },
      { name: "ລູກຄ້າ", icon: <Package />, path: "/admin/customers" },
      { name: "ສິນຄ້າຂອງຜູ້ສະໜອງ", icon: <Package />, path: "/admin/supplier-products" },
     
    ],
  },
  
  {
    name: "ສັ່ງຊື້ສິນຄ້າ",
    icon: <Ambulance />,
    path: "/admin/purchase-order",
  },
  {
    name: "ນຳເຂົ້າສິນຄ້າ",
    icon: <PanelTopOpen />,
    path: "/admin/input-product",
  },
  {
    name: "ເບີກສິນຄ້າອອກ",
    icon: <ShoppingBag  />,
    path: "/user",
  },
  {
    name: "ລາຍງານຕ່າງໆ",
    icon: <Shredder />,
    sub: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard />,
        path: "/admin/dashboard",
      },
      // {
      //   name: "ປະຫວັດການຂາຍ",
      //   icon: <CalendarArrowDown />,
      //   path: "/admin/order",
      // },
      {
        name: "ລາຍງານສິນຄ້າຄົງຄັງ",
        icon: <CalendarArrowDown />,
        path: "/admin/inventoryReports",
      },
      {
        name: "ລາຍງານເບີກສິນຄ້າອອກສິນຄ້າ",
        icon: <CalendarArrowDown />,
        path: "/admin/product-report",
      },
    ],
  },
];

export default MenuAdminDropdown;
