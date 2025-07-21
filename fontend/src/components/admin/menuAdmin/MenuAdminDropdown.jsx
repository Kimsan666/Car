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
  ShoppingBag,
} from "lucide-react";

const MenuAdminDropdown = [
  {
    name: "ຈັດການຂໍ້ມູນສິນຄ້າ",
    icon: <PackageSearch />,
    sub: [
      { name: "ລົດ", icon: <PackageSearch />, path: "/admin/cars" },
      { name: "ແບນ", icon: <Boxes />, path: "/admin/brands" },
      { name: "ສີ", icon: <Combine />, path: "/admin/colors" },
      { name: "ປະເພດ", icon: <Container />, path: "/admin/types" },
      { name: "ລຸ້ນຂອງແບນ", icon: <Warehouse />, path: "/admin/brandmodels" },
      { name: "ຜູ້ສະໜອງ", icon: <Package />, path: "/admin/suppliers" },
      { name: "ພະນັກງານ", icon: <SquareUser />, path: "/admin/edit-cars" },
      {
        name: "ຜູ້ໃໍຊ້ລະບົບ",
        icon: <CircleUserRound />,
        path: "/admin/datauser",
      },
      { name: "ລູກຄ້າ", icon: <Package />, path: "/admin/customers" },
      {
        name: "ສິນຄ້າຂອງຜູ້ສະໜອງ",
        icon: <Package />,
        path: "/admin/supplier-products",
      },
    ],
  },

  {
    name: "ສັ່ງຊື້ສິນຄ້າ",
    icon: <Ambulance />,
    path: "/admin/purchases",
  },
  {
    name: "ນຳເຂົ້າສິນຄ້າ",
    icon: <PanelTopOpen />,
    path: "/admin/input-cars",
  },
  {
    name: "ເບີກສິນຄ້າອອກ",
    icon: <ShoppingBag />,
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
