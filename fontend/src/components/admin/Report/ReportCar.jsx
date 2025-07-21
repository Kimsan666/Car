import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Filter, Car, BarChart3, Package, TrendingUp, TrendingDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import useCarStore from '../../../Store/car-store';

const ReportCar = () => {
  // ໃຊ້ store ທີ່ແທ້ຈິງຈາກ import
  const { 
    cars, 
    brands, 
    brandAndModels, 
    getCar, 
    getBrand, 
    getBrandAndModel 
  } = useCarStore();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug log to check if store data is coming
  useEffect(() => {
    console.log('Store Debug:', { 
      cars: cars?.length || 0, 
      brands: brands?.length || 0, 
      brandAndModels: brandAndModels?.length || 0 
    });
  }, [cars, brands, brandAndModels]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Starting to load data...');
        await Promise.all([
          getCar(),
          getBrand(),
          getBrandAndModel()
        ]);
        console.log('Data loading completed');
      } catch (error) {
        console.error('Error loading data:', error);
        setError('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getCar, getBrand, getBrandAndModel]);

  // Filtered cars based on search criteria
  const filteredCars = useMemo(() => {
    if (!cars || !Array.isArray(cars) || cars.length === 0) return [];
    
    return cars.filter(car => {
      // Safe property access with fallbacks
      const carName = car?.name || '';
      const licensePlate = car?.licensePlate || '';
      const vin = car?.vin || '';
      const brandName = car?.brandAndModels?.BrandCars?.name || car?.brandCars?.name || '';
      const modelName = car?.brandAndModels?.modelCar || '';
      const carStatus = car?.status || '';

      const matchesSearch = !searchTerm || 
        carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vin.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand = !selectedBrand || brandName === selectedBrand;
      const matchesModel = !selectedModel || modelName === selectedModel;
      const matchesStatus = !statusFilter || carStatus === statusFilter;

      return matchesSearch && matchesBrand && matchesModel && matchesStatus;
    });
  }, [cars, searchTerm, selectedBrand, selectedModel, statusFilter]);

  // Summary statistics
  const summary = useMemo(() => {
    if (!cars || !Array.isArray(cars) || cars.length === 0) {
      return { total: 0, available: 0, sold: 0, reserved: 0, maintenance: 0 };
    }

    const total = cars.length;
    const available = cars.filter(car => car?.status === 'Available').length;
    const sold = cars.filter(car => car?.status === 'Sold').length;
    const reserved = cars.filter(car => car?.status === 'Reserved').length;
    const maintenance = cars.filter(car => car?.status === 'Maintenance').length;

    return { total, available, sold, reserved, maintenance };
  }, [cars]);

  // Brand and Model summary
  const brandModelSummary = useMemo(() => {
    if (!cars || !Array.isArray(cars) || cars.length === 0) {
      return {};
    }

    const summary = {};
    
    cars.forEach(car => {
      // More flexible brand name extraction
      const brandName = car?.brandAndModels?.BrandCars?.name || 
                       car?.brandCars?.name || 
                       'Unknown';
      const modelName = car?.brandAndModels?.modelCar || 'Unknown';
      const status = car?.status?.toLowerCase() || 'unknown';

      if (!summary[brandName]) {
        summary[brandName] = {
          total: 0,
          available: 0,
          sold: 0,
          reserved: 0,
          maintenance: 0,
          models: {}
        };
      }

      if (!summary[brandName].models[modelName]) {
        summary[brandName].models[modelName] = {
          total: 0,
          available: 0,
          sold: 0,
          reserved: 0,
          maintenance: 0
        };
      }

      // Update brand totals
      summary[brandName].total++;
      if (summary[brandName][status] !== undefined) {
        summary[brandName][status]++;
      }

      // Update model totals
      summary[brandName].models[modelName].total++;
      if (summary[brandName].models[modelName][status] !== undefined) {
        summary[brandName].models[modelName][status]++;
      }
    });

    return summary;
  }, [cars]);

  // Available models based on selected brand
  const availableModels = useMemo(() => {
    if (!brandAndModels || !Array.isArray(brandAndModels) || brandAndModels.length === 0) return [];
    if (!selectedBrand) return brandAndModels;
    
    return brandAndModels.filter(model => {
      const modelBrandName = model?.BrandCars?.name || model?.brandCars?.name || '';
      return modelBrandName === selectedBrand;
    });
  }, [selectedBrand, brandAndModels]);

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Car inventory sheet
      const carData = filteredCars.map(car => ({
        'ID': car?.id || '',
        'ຊື່ລົດ': car?.name || '',
        'ປ້າຍທະບຽນ': car?.licensePlate || '',
        'ປີ': car?.year || '',
        'ແບຣນ': car?.brandAndModels?.BrandCars?.name || car?.brandCars?.name || '',
        'ລຸ້ນ': car?.brandAndModels?.modelCar || '',
        'ສີ': car?.colorCar?.name || '',
        'ປະເພດ': car?.typecar?.name || '',
        'ສະຖານະ': car?.status || '',
        'ລາຄາຂາຍ': car?.price || 0,
        'ລາຄາຕົ້ນທຶນ': car?.costPrice || 0,
        'VIN': car?.vin || '',
        'ວັນທີ່ສ້າງ': car?.createdAt ? new Date(car.createdAt).toLocaleDateString('lo-LA') : '',
        'ວັນທີ່ຂາຍ': car?.soldDate ? new Date(car.soldDate).toLocaleDateString('lo-LA') : '',
        'ລາຄາຂາຍຈິງ': car?.soldPrice || ''
      }));

      const ws1 = XLSX.utils.json_to_sheet(carData);
      XLSX.utils.book_append_sheet(wb, ws1, "ລາຍການລົດ");

      // Enhanced Summary sheet
      const totalInventoryValue = cars.reduce((sum, car) => sum + (car?.price || 0), 0);
      const totalCostValue = cars.reduce((sum, car) => sum + (car?.costPrice || 0), 0);
      const soldCarsValue = cars.filter(car => car?.status === 'Sold')
                                .reduce((sum, car) => sum + (car?.soldPrice || car?.price || 0), 0);
      const availableValue = cars.filter(car => car?.status === 'Available')
                                .reduce((sum, car) => sum + (car?.price || 0), 0);

      const summaryData = [
        { 'ປະເພດສະຫຼຸບ': '=== ສະຫຼຸບຈຳນວນ ===', 'ລາຍລະອຽດ': '', 'ຈຳນວນ/ມູນຄ່າ': '' },
        { 'ປະເພດສະຫຼຸບ': 'ລົດທັງໝົດ', 'ລາຍລະອຽດ': 'ຈຳນວນລົດທັງໝົດໃນລະບົບ', 'ຈຳນວນ/ມູນຄ່າ': summary.total },
        { 'ປະເພດສະຫຼຸບ': 'ລົດວ່າງ', 'ລາຍລະອຽດ': 'ລົດທີ່ພ້ອມຂາຍ', 'ຈຳນວນ/ມູນຄ່າ': summary.available },
        { 'ປະເພດສະຫຼຸບ': 'ລົດຂາຍແລ້ວ', 'ລາຍລະອຽດ': 'ລົດທີ່ຂາຍອອກໄປແລ້ວ', 'ຈຳນວນ/ມູນຄ່າ': summary.sold },
        { 'ປະເພດສະຫຼຸບ': 'ລົດຈອງແລ້ວ', 'ລາຍລະອຽດ': 'ລົດທີ່ລູກຄ້າຈອງໄວ້', 'ຈຳນວນ/ມູນຄ່າ': summary.reserved },
        { 'ປະເພດສະຫຼຸບ': 'ລົດສ້ອມແປງ', 'ລາຍລະອຽດ': 'ລົດທີ່ຢູ່ໃນຂະບວນການສ້ອມແປງ', 'ຈຳນວນ/ມູນຄ່າ': summary.maintenance },
        { 'ປະເພດສະຫຼຸບ': '', 'ລາຍລະອຽດ': '', 'ຈຳນວນ/ມູນຄ່າ': '' },
        { 'ປະເພດສະຫຼຸບ': '=== ສະຫຼຸບມູນຄ່າ (USD) ===', 'ລາຍລະອຽດ': '', 'ຈຳນວນ/ມູນຄ່າ': '' },
        { 'ປະເພດສະຫຼຸບ': 'ມູນຄ່າສິນຄ້າຄົງຄັງທັງໝົດ', 'ລາຍລະອຽດ': 'ມູນຄ່າຂາຍຂອງລົດທັງໝົດ', 'ຈຳນວນ/ມູນຄ່າ': `${totalInventoryValue.toLocaleString()}` },
        { 'ປະເພດສະຫຼຸບ': 'ມູນຄ່າຕົ້ນທຶນທັງໝົດ', 'ລາຍລະອຽດ': 'ມູນຄ່າຕົ້ນທຶນຂອງລົດທັງໝົດ', 'ຈຳນວນ/ມູນຄ່າ': `${totalCostValue.toLocaleString()}` },
        { 'ປະເພດສະຫຼຸບ': 'ມູນຄ່າລົດວ່າງ', 'ລາຍລະອຽດ': 'ມູນຄ່າຂາຍຂອງລົດທີ່ວ່າງ', 'ຈຳນວນ/ມູນຄ່າ': `${availableValue.toLocaleString()}` },
        { 'ປະເພດສະຫຼຸບ': 'ມູນຄ່າຂາຍທີ່ໄດ້ຮັບ', 'ລາຍລະອຽດ': 'ເງິນທີ່ໄດ້ຮັບຈາກການຂາຍ', 'ຈຳນວນ/ມູນຄ່າ': `${soldCarsValue.toLocaleString()}` },
        { 'ປະເພດສະຫຼຸບ': 'ກຳໄລຄາດຄະເນ', 'ລາຍລະອຽດ': 'ຜົນຕ່າງລະຫວ່າງຂາຍແລະຕົ້ນທຶນ', 'ຈຳນວນ/ມູນຄ່າ': `${(totalInventoryValue - totalCostValue).toLocaleString()}` },
        { 'ປະເພດສະຫຼຸບ': '', 'ລາຍລະອຽດ': '', 'ຈຳນວນ/ມູນຄ່າ': '' },
        { 'ປະເພດສະຫຼຸບ': '=== ເປີເຊັນສະຖິຕິ ===', 'ລາຍລະອຽດ': '', 'ຈຳນວນ/ມູນຄ່າ': '' },
        { 'ປະເພດສະຫຼຸບ': 'ອັດຕາລົດວ່າງ', 'ລາຍລະອຽດ': 'ເປີເຊັນຂອງລົດທີ່ວ່າງ', 'ຈຳນວນ/ມູນຄ່າ': `${summary.total > 0 ? ((summary.available / summary.total) * 100).toFixed(1) : 0}%` },
        { 'ປະເພດສະຫຼຸບ': 'ອັດຕາການຂາຍ', 'ລາຍລະອຽດ': 'ເປີເຊັນຂອງລົດທີ່ຂາຍແລ້ວ', 'ຈຳນວນ/ມູນຄ່າ': `${summary.total > 0 ? ((summary.sold / summary.total) * 100).toFixed(1) : 0}%` },
        { 'ປະເພດສະຫຼຸບ': 'ອັດຕາການຈອງ', 'ລາຍລະອຽດ': 'ເປີເຊັນຂອງລົດທີ່ຈອງແລ້ວ', 'ຈຳນວນ/ມູນຄ່າ': `${summary.total > 0 ? ((summary.reserved / summary.total) * 100).toFixed(1) : 0}%` }
      ];

      const ws2 = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws2, "ສະຫຼຸບລວມ");

      // Brand model summary sheet
      const brandModelData = [];
      Object.keys(brandModelSummary).forEach(brand => {
        const brandData = brandModelSummary[brand];
        brandModelData.push({
          'ແບຣນ': brand,
          'ລຸ້ນ': 'ລວມ',
          'ທັງໝົດ': brandData.total,
          'ວ່າງ': brandData.available,
          'ຂາຍແລ້ວ': brandData.sold,
          'ຈອງແລ້ວ': brandData.reserved,
          'ສ້ອມແປງ': brandData.maintenance || 0
        });

        Object.keys(brandData.models).forEach(model => {
          const modelData = brandData.models[model];
          brandModelData.push({
            'ແບຣນ': '',
            'ລຸ້ນ': model,
            'ທັງໝົດ': modelData.total,
            'ວ່າງ': modelData.available,
            'ຂາຍແລ້ວ': modelData.sold,
            'ຈອງແລ້ວ': modelData.reserved,
            'ສ້ອມແປງ': modelData.maintenance || 0
          });
        });
      });

      const ws3 = XLSX.utils.json_to_sheet(brandModelData);
      XLSX.utils.book_append_sheet(wb, ws3, "ສະຫຼຸບຕາມແບຣນ");

      // Year summary
      const yearSummary = {};
      cars.forEach(car => {
        const year = car?.year || 'ບໍ່ຮູ້ປີ';
        if (!yearSummary[year]) {
          yearSummary[year] = {
            total: 0,
            available: 0,
            sold: 0,
            reserved: 0,
            maintenance: 0,
            totalValue: 0,
            avgPrice: 0
          };
        }
        yearSummary[year].total++;
        yearSummary[year][car?.status?.toLowerCase()] = (yearSummary[year][car?.status?.toLowerCase()] || 0) + 1;
        yearSummary[year].totalValue += (car?.price || 0);
      });

      const yearData = Object.keys(yearSummary).map(year => ({
        'ປີ': year,
        'ທັງໝົດ': yearSummary[year].total,
        'ວ່າງ': yearSummary[year].available || 0,
        'ຂາຍແລ້ວ': yearSummary[year].sold || 0,
        'ຈອງແລ້ວ': yearSummary[year].reserved || 0,
        'ສ້ອມແປງ': yearSummary[year].maintenance || 0,
        'ມູນຄ່າລວມ': `${yearSummary[year].totalValue.toLocaleString()}`,
        'ລາຄາສະເລ່ຍ': `${(yearSummary[year].totalValue / yearSummary[year].total).toLocaleString()}`
      }));

      const ws4 = XLSX.utils.json_to_sheet(yearData);
      XLSX.utils.book_append_sheet(wb, ws4, "ສະຫຼຸບຕາມປີ");

      // Status detail summary
      const statusDetail = [
        {
          'ສະຖານະ': 'Available (ວ່າງ)',
          'ຈຳນວນ': summary.available,
          'ເປີເຊັນ': `${summary.total > 0 ? ((summary.available / summary.total) * 100).toFixed(1) : 0}%`,
          'ມູນຄ່າ': `${availableValue.toLocaleString()}`,
          'ຄຳອະທິບາຍ': 'ລົດທີ່ພ້ອມຂາຍໃຫ້ລູກຄ້າ'
        },
        {
          'ສະຖານະ': 'Sold (ຂາຍແລ້ວ)',
          'ຈຳນວນ': summary.sold,
          'ເປີເຊັນ': `${summary.total > 0 ? ((summary.sold / summary.total) * 100).toFixed(1) : 0}%`,
          'ມູນຄ່າ': `${soldCarsValue.toLocaleString()}`,
          'ຄຳອະທິບາຍ': 'ລົດທີ່ຂາຍອອກໄປແລ້ວ'
        },
        {
          'ສະຖານະ': 'Reserved (ຈອງແລ້ວ)',
          'ຈຳນວນ': summary.reserved,
          'ເປີເຊັນ': `${summary.total > 0 ? ((summary.reserved / summary.total) * 100).toFixed(1) : 0}%`,
          'ມູນຄ່າ': `${cars.filter(car => car?.status === 'Reserved').reduce((sum, car) => sum + (car?.price || 0), 0).toLocaleString()}`,
          'ຄຳອະທິບາຍ': 'ລົດທີ່ລູກຄ້າຈອງໄວ້'
        },
        {
          'ສະຖານະ': 'Maintenance (ສ້ອມແປງ)',
          'ຈຳນວນ': summary.maintenance,
          'ເປີເຊັນ': `${summary.total > 0 ? ((summary.maintenance / summary.total) * 100).toFixed(1) : 0}%`,
          'ມູນຄ່າ': `${cars.filter(car => car?.status === 'Maintenance').reduce((sum, car) => sum + (car?.price || 0), 0).toLocaleString()}`,
          'ຄຳອະທິບາຍ': 'ລົດທີ່ຢູ່ໃນຂະບວນການສ້ອມແປງ'
        }
      ];

      const ws5 = XLSX.utils.json_to_sheet(statusDetail);
      XLSX.utils.book_append_sheet(wb, ws5, "ລາຍລະອຽດສະຖານະ");

      // Save file
      XLSX.writeFile(wb, `ລາຍງານສິນຄ້າຄົງຄັງລົດ_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ Excel');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Sold': return 'bg-red-100 text-red-800';
      case 'Reserved': return 'bg-yellow-100 text-yellow-800';
      case 'Maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Available': return 'ວ່າງ';
      case 'Sold': return 'ຂາຍແລ້ວ';
      case 'Reserved': return 'ຈອງແລ້ວ';
      case 'Maintenance': return 'ສ້ອມແປງ';
      default: return status || 'ບໍ່ຮູ້';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <Filter className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ເກີດຂໍ້ຜິດພາດ</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ລອງໃໝ່
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-notosanslao bg-gray-50 p-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
            {/* Debug info */}
            <div className="mt-2 text-sm text-gray-500">
              Cars: {cars?.length || 0} | Brands: {brands?.length || 0} | Models: {brandAndModels?.length || 0}
            </div>
          </div>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Car className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ລາຍງານສິນຄ້າຄົງຄັງລົດ</h1>
                <p className="text-gray-600">Car Inventory Report</p>
              </div>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              ສົ່ງອອກ Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ລົດທັງໝົດ</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ລົດວ່າງ</p>
                <p className="text-2xl font-bold text-green-600">{summary.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ລົດຂາຍແລ້ວ</p>
                <p className="text-2xl font-bold text-red-600">{summary.sold}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ລົດຈອງແລ້ວ</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.reserved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Filter className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ສ້ອມແປງ</p>
                <p className="text-2xl font-bold text-purple-600">{summary.maintenance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ຄົ້ນຫາ (ຊື່, ປ້າຍທະບຽນ, VIN)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ປ້ອນຄຳຄົ້ນຫາ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ແບຣນ</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel(''); // Reset model when brand changes
                }}
              >
                <option value="">ທັງໝົດ</option>
                {brands && Array.isArray(brands) && brands.map(brand => (
                  <option key={brand.id} value={brand.name}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ລຸ້ນ</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="">ທັງໝົດ</option>
                {availableModels && Array.isArray(availableModels) && availableModels.map(model => (
                  <option key={model.id} value={model.modelCar}>{model.modelCar}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ສະຖານະ</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">ທັງໝົດ</option>
                <option value="Available">ວ່າງ</option>
                <option value="Sold">ຂາຍແລ້ວ</option>
                <option value="Reserved">ຈອງແລ້ວ</option>
                <option value="Maintenance">ສ້ອມແປງ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Car List Table */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              ລາຍການລົດ ({filteredCars.length} ຄັນ)
            </h2>
          </div>
          
          {filteredCars.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ບໍ່ພົບຂໍ້ມູນລົດ</p>
              {/* Debug info */}
              <div className="mt-2 text-sm text-red-500">
                Debug: cars array length = {cars?.length || 0}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ລົດ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ແບຣນ/ລຸ້ນ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ປ້າຍທະບຽນ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ປີ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ສະຖານະ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ລາຄາ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VIN
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{car?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{car?.colorCar?.name || 'N/A'} • {car?.typecar?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{car?.brandAndModels?.BrandCars?.name || car?.brandCars?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{car?.brandAndModels?.modelCar || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {car?.licensePlate || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {car?.year || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(car?.status)}`}>
                          {getStatusText(car?.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${car?.price?.toLocaleString() || '0'}
                        </div>
                        {car?.soldPrice && (
                          <div className="text-sm text-green-600">
                            ຂາຍ: ${car.soldPrice?.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {car?.vin || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Brand and Model Summary */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              ສະຫຼຸບຕາມແບຣນແລະລຸ້ນ
            </h2>
          </div>
          
          {Object.keys(brandModelSummary).length === 0 ? (
            <div className="px-6 py-8 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ບໍ່ມີຂໍ້ມູນສະຫຼຸບ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ແບຣນ/ລຸ້ນ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ທັງໝົດ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ວ່າງ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ຂາຍແລ້ວ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ຈອງແລ້ວ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.keys(brandModelSummary).map((brand) => {
                    const brandData = brandModelSummary[brand];
                    return (
                      <React.Fragment key={brand}>
                        {/* Brand total row */}
                        <tr className="bg-blue-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{brand}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                            {brandData.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-green-600">
                            {brandData.available || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-red-600">
                            {brandData.sold || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-yellow-600">
                            {brandData.reserved || 0}
                          </td>
                        </tr>
                        {/* Model rows */}
                        {Object.keys(brandData.models).map((model) => {
                          const modelData = brandData.models[model];
                          return (
                            <tr key={`${brand}-${model}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 ml-4">→ {model}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                {modelData.total}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600">
                                {modelData.available || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600">
                                {modelData.sold || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-yellow-600">
                                {modelData.reserved || 0}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default ReportCar;