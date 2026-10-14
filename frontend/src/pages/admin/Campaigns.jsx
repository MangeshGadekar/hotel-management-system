import { useEffect, useState } from "react";
import { createCampaign, fetchAllCampaigns, sendCampaign, fetchCampaignAudience, deleteCampaign } from "../../apis/api";

export default function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModelOpen] = useState(false);
    const [audience, setAudience] = useState([]);
    const [isAudienceOpen, setIsAudienceOpen] = useState(false);
    const [formData, setFormData] = useState({
        campaignName: '',
        subjectLine: '',
        emailContent: '',
        targetAudience: '',
        campaignType: '',
        filterStartDate: '',
        filterEndDate: '',
    });

    useEffect(() => {
        loadCampaigns();
    }, []);
    const loadCampaigns = async () => {
        try {
            const data = await fetchAllCampaigns();
            setCampaigns(data);

        } catch (error) {
            console.error('Failed to load campaigns:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleCreateCampaign = async () => {

        try {

            await createCampaign(formData);

            await loadCampaigns();

            setFormData({
                campaignName: '',
                subjectLine: '',
                emailContent: '',
                targetAudience: '',
                campaignType: '',
            });

            setIsModelOpen(false);

        } catch (error) {

            console.error('Failed to create campaign:', error);

        }

    };
    const handleViewAudience = async (campaignId) => {
        try {
            const data = await fetchCampaignAudience(campaignId);
            setAudience(data);
            setIsAudienceOpen(true);
        } catch (error) {
            console.error("Failed to load campaign audience:", error);
        }
    };
    const handleSendCampaign = async (campaignId) => {
        try {
            await sendCampaign(campaignId);

            await loadCampaigns();
        } catch (error) {
            console.error("Failed to send campaign:", error);
        }
    };
    const handleDeleteCampaign = async (campaignId) => {
        try {
            await deleteCampaign(campaignId);
            setCampaigns((prevCampaigns) =>
                prevCampaigns.filter((campaign) =>
                    campaign.id !== campaignId));
        } catch (error) {
            console.error("Failed to delete campaign:", error);
        }
    };
    if (loading) {
        return (<div className="p-6 text-slate-500">Loading campaigns...</div>);
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-xl font-bold text-slate-800">Campaigns</h1>
                <p className="text-xs text-slate-500 mt-0.5">Create and manage guest Campaigns</p>
            </div>
            <button onClick={() => setIsModelOpen(true)} className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg shadow-xs transition"
                >+ Create Campaign</button>
                </div>

            {campaigns.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <p className="text-slate-500">No campaigns found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">{campaigns.map((campaign) => (
                    <div key={campaign.id}
                        className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-800">{campaign.campaignName}</h2>
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                                {campaign.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-3">{campaign.subjectLine}</p>
                        <div className="mt-4 space-y-1 text-xs text-slate-500">
                            <p>
                                Audience:{' '}
                                <span className="font-semibold text-slate-700">{campaign.targetAudience}</span>
                            </p>
                            <p>Type:{' '}
                                <span className="font-semibold text-slate-700">{campaign.campaignType}</span>
                            </p>
                            <p>
                                Created:{' '}
                                <span className="font-semibold text-slate-700">{campaign.createdAt}</span>
                            </p>

                        </div>
                        <div className="flex gap-2 mt-5">
                            <button
                                type="button"
                                onClick={() => handleViewAudience(campaign.id)}
                                className="px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                            >
                                View Audience
                            </button>

                            {campaign.status === "DRAFT" && (
                                <button
                                    type="button"
                                    onClick={() => handleSendCampaign(campaign.id)}
                                    className="px-3 py-2 text-xs font-semibold text-white bg-[#D96B43] rounded-lg hover:bg-[#c25a34]"
                                >
                                    Send
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => handleDeleteCampaign(campaign.id)}
                                className="px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                </div>
            )}
            {isAudienceOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">

                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-800">
                                Campaign Audience
                            </h2>

                            <button
                                onClick={() => setIsAudienceOpen(false)}
                                className="text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        {audience.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-6">
                                No audience found for this campaign.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {audience.map((guest, index) => (
                                    <div
                                        key={guest.id || index}
                                        className="border border-slate-200 rounded-lg p-3"
                                    >
                                        <p className="font-semibold text-slate-700">
                                            {guest.name}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {guest.email}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-800">
                                Create Campaign
                            </h2>

                            <button
                                onClick={() => setIsModelOpen(false)}
                                className="text-slate-500"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Campaign Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter campaign name"
                                    value={formData.campaignName}
                                    onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D96B43]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Subject Line
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter subject line"
                                    value={formData.subjectLine}
                                    onChange={(e) => setFormData({ ...formData, subjectLine: e.target.value })
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D96B43]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email Content
                                </label>
                                <textarea
                                    rows="5"
                                    placeholder="Enter email content"
                                    value={formData.emailContent}
                                    onChange={(e) => setFormData({ ...formData, emailContent: e.target.value })
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D96B43] resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Target Audience
                                </label>

                                <select
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D96B43]"
                                >
                                    <option value="">Select target audience</option>
                                    <option value="UPCOMING_BIRTHDAYS">Upcoming Birthdays</option>
                                    <option value="STAY_ANNIVERSARIES">Stay Anniversaries</option>
                                    <option value="FREQUENT_VISITORS">Frequent Visitors</option>
                                    <option value="ALL_CUSTOMERS">All Customers</option>
                                    <option value="BY_DATE_RANGE">By Date Range</option>
                                </select>
                            </div>
                            {formData.targetAudience === "BY_DATE_RANGE" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.filterStartDate}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    filterStartDate: e.target.value
                                                })
                                            }
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D96B43]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.filterEndDate}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    filterEndDate: e.target.value
                                                })
                                            }
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D96B43]"
                                        />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Campaign Type
                                </label>

                                <select
                                    value={formData.campaignType}
                                    onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D96B43]"
                                >
                                    <option value="">Select campaign type</option>
                                    <option value="ANNIVERSARY_GREETING">Anniversary Greeting</option>
                                    <option value="MEMBERSHIP_OFFERS">Membership Offers</option>
                                    <option value="FESTIVAL_OFFERS">Festival Offers</option>
                                    <option value="SEASONAL_DISCOUNTS">Seasonal Discounts</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button"
                                onClick={() => setIsModelOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg">Cancel</button>

                            <button type="button"
                                onClick={handleCreateCampaign}
                                className="px-4 py-2 bg-[#D96B43] hover:bg-[#c25a34] text-white text-sm font-semibold rounded-lg">Create Campaign</button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );


}