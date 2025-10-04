"use client";
import { useState, useEffect } from "react";
import { API_ENDPOINT } from "../config/api";

interface PlatformAsset {
  id: string;
  name: string;
  symbol: string;
  network: string;
  depositAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: PlatformAsset[];
}

interface CreateAssetRequest {
  name: string;
  symbol: string;
  network: string;
  depositAddress: string;
}



const AssetsPage = () => {
  const [assets, setAssets] = useState<PlatformAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // Update modal states
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<PlatformAsset | null>(null);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Form states
  const [newAsset, setNewAsset] = useState<CreateAssetRequest>({
    name: "",
    symbol: "",
    network: "",
    depositAddress: ""
  });

  const [updateForm, setUpdateForm] = useState({
    name: "",
    symbol: "",
    network: "",
    depositAddress: ""
  });

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(API_ENDPOINT.ASSEST.GET_ASSET, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.status === 200 && result.data) {
        setAssets(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch assets");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching assets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new asset
  const createAsset = async (assetData: CreateAssetRequest) => {
    try {
      setCreateLoading(true);
      setCreateError(null);
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(API_ENDPOINT.ASSEST.CREATE_ASSET, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 201 || result.status === 200) {
        await fetchAssets();
        setShowCreateModal(false);
        setNewAsset({
          name: "",
          symbol: "",
          network: "",
          depositAddress: ""
        });
        return result;
      } else {
        throw new Error(result.message || "Failed to create asset");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setCreateError(errorMessage);
      console.error("Error creating asset:", err);
      throw err;
    } finally {
      setCreateLoading(false);
    }
  };

  // Update asset function
  const updateAsset = async (assetId: string, updateData: {
    name?: string;
    symbol?: string;
    network?: string;
    depositAddress?: string;
  }) => {
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Replace {id} with actual assetId in the URL
      const updateUrl = API_ENDPOINT.ASSEST.UPDATE_ASSEST.replace('{id}', assetId);

      const response = await fetch(updateUrl, {
        method: "PATCH",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      await fetchAssets();
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setUpdateError(errorMessage);
      console.error("Error updating asset:", err);
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (asset: PlatformAsset) => {
    setSelectedAsset(asset);
    setUpdateForm({
      name: asset.name,
      symbol: asset.symbol,
      network: asset.network,
      depositAddress: asset.depositAddress
    });
    setUpdateError(null);
    setShowUpdateModal(true);
  };

  // Handle update form input changes
  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (updateError) {
      setUpdateError(null);
    }
  };

  // Handle update form submission
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAsset) return;

    try {
      setUpdateLoading(true);
      
      // Prepare update data - only include fields that have changed
      const updateData: Partial<CreateAssetRequest> = {};
      if (updateForm.name !== selectedAsset.name) updateData.name = updateForm.name;
      if (updateForm.symbol !== selectedAsset.symbol) updateData.symbol = updateForm.symbol;
      if (updateForm.network !== selectedAsset.network) updateData.network = updateForm.network;
      if (updateForm.depositAddress !== selectedAsset.depositAddress) updateData.depositAddress = updateForm.depositAddress;
      
      // If no changes, close modal
      if (Object.keys(updateData).length === 0) {
        setShowUpdateModal(false);
        return;
      }

      await updateAsset(selectedAsset.id, updateData);
      setShowUpdateModal(false);
      
    } catch (err) {
      console.error("Failed to fetch data", err)
    } finally {
      setUpdateLoading(false);
    }
  };

  // Reset update form
  const resetUpdateForm = () => {
    setSelectedAsset(null);
    setUpdateForm({
      name: "",
      symbol: "",
      network: "",
      depositAddress: ""
    });
    setUpdateError(null);
    setShowUpdateModal(false);
  };

  // Create form handlers (existing)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAsset.name || !newAsset.symbol || !newAsset.network || !newAsset.depositAddress) {
      setCreateError("All fields are required");
      return;
    }

    try {
      await createAsset(newAsset);
    } catch (err) {
      console.error("Failed to fetch data", err)
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (createError) {
      setCreateError(null);
    }
  };

  const resetCreateForm = () => {
    setNewAsset({
      name: "",
      symbol: "",
      network: "",
      depositAddress: ""
    });
    setCreateError(null);
    setShowCreateModal(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mx-auto mb-4 text-[#F2AF29]"></div>
          <p className="text-gray-400">Loading platform assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchAssets}
            className="bg-[#F2AF29] hover:bg-[#e5a524] text-white font-medium px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Assets</h1>
            <p className="text-gray-400 mt-2">
              Manage and view all available platform assets
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchAssets}
              className="bg-[#01BC8D] hover:bg-[#00a87c] text-white font-medium px-4 py-2 rounded-md transition-colors"
            >
              Refresh Assets
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#F2AF29] hover:bg-[#e5a524] text-white font-medium px-4 py-2 rounded-md transition-colors"
            >
              Create New Asset
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#141E32] border border-[#243049] rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Assets</p>
            <p className="text-2xl font-bold text-white">{assets.length}</p>
          </div>
          <div className="bg-[#141E32] border border-[#243049] rounded-lg p-4">
            <p className="text-gray-400 text-sm">Networks</p>
            <p className="text-2xl font-bold text-white">
              {new Set(assets.map(asset => asset.network)).size}
            </p>
          </div>
        </div>

        {/* Assets Table */}
        <div className="border border-[#243049] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#060A17]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Network
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Deposit Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {assets.length > 0 ? (
                  assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-[#1a253c] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {asset.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {asset.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-[#F2AF29] text-white rounded-full">
                          {asset.symbol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {asset.network}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="font-mono text-xs px-2 py-1 rounded">
                          {asset.depositAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(asset.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(asset.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleEditClick(asset)}
                          className="bg-[#F2AF29] hover:bg-[#e5a524] text-white font-medium px-3 py-1 rounded-md transition-colors text-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-center text-gray-500 text-sm">
          Showing {assets.length} asset{assets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141E32] border border-[#243049] rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Create New Asset</h2>
                <button
                  onClick={resetCreateForm}
                  disabled={createLoading}
                  className="text-gray-400 hover:text-white text-2xl font-bold disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newAsset.name}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                    placeholder="e.g., Bitcoin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Symbol
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    value={newAsset.symbol}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                    placeholder="e.g., BTC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Network
                  </label>
                  <input
                    type="text"
                    name="network"
                    value={newAsset.network}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                    placeholder="e.g., Bitcoin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deposit Address
                  </label>
                  <input
                    type="text"
                    name="depositAddress"
                    value={newAsset.depositAddress}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                    placeholder="e.g., 0x1234567890abcdef..."
                    required
                  />
                </div>

                {createError && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3">
                    <p className="text-red-300 text-sm">{createError}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetCreateForm}
                    disabled={createLoading}
                    className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 bg-[#F2AF29] text-white rounded-lg hover:bg-[#e5a524] transition-colors disabled:opacity-50 flex items-center"
                  >
                    {createLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      "Create Asset"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Asset Modal */}
      {showUpdateModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141E32] border border-[#243049] rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Update Asset</h2>
                <button
                  onClick={resetUpdateForm}
                  disabled={updateLoading}
                  className="text-gray-400 hover:text-white text-2xl font-bold disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={updateForm.name}
                    onChange={handleUpdateInputChange}
                    className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Symbol
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    value={updateForm.symbol}
                    onChange={handleUpdateInputChange}
                    className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Network
                  </label>
                  <input
                    type="text"
                    name="network"
                    value={updateForm.network}
                    onChange={handleUpdateInputChange}
                    className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deposit Address
                  </label>
                  <input
                    type="text"
                    name="depositAddress"
                    value={updateForm.depositAddress}
                    onChange={handleUpdateInputChange}
                    className="w-full bg-[#0A0F1C] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#F2AF29]"
                    required
                  />
                </div>

                {updateError && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3">
                    <p className="text-red-300 text-sm">{updateError}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetUpdateForm}
                    disabled={updateLoading}
                    className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-4 py-2 bg-[#F2AF29] text-white rounded-lg hover:bg-[#e5a524] transition-colors disabled:opacity-50 flex items-center"
                  >
                    {updateLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      "Update Asset"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;