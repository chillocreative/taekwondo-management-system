import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Toast from '@/Components/Toast';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function PaymentSettings({ auth, settings, flash }) {
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [toast, setToast] = useState(null);

    // Show toast when flash messages are present
    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const { data, setData, post, processing, errors } = useForm({
        provider: settings?.provider || 'toyyibpay',
        is_sandbox: settings?.is_sandbox ?? true,
        secret_key: settings?.secret_key || '',
        category_code: settings?.category_code || '',
        is_active: settings?.is_active ?? false,
        // Bayarcash
        bayarcash_access_token: settings?.bayarcash_access_token || '',
        bayarcash_portal_key: settings?.bayarcash_portal_key || '',
        bayarcash_is_sandbox: settings?.bayarcash_is_sandbox ?? true,
        bayarcash_is_active: settings?.bayarcash_is_active ?? false,
        // SenangPay
        senangpay_merchant_id: settings?.senangpay_merchant_id || '',
        senangpay_secret_key: settings?.senangpay_secret_key || '',
        senangpay_is_sandbox: settings?.senangpay_is_sandbox ?? true,
        senangpay_is_active: settings?.senangpay_is_active ?? false,
    });

    const categoryForm = useForm({
        catname: '',
        catdescription: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.payment.update'));
    };

    const handleCreateCategory = (e) => {
        e.preventDefault();
        categoryForm.post(route('settings.payment.create-category'), {
            onSuccess: () => {
                setShowCategoryModal(false);
                categoryForm.reset();
            },
        });
    };

    const testConnection = () => {
        router.post(route('settings.payment.test'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-zinc-900">
                    Payment Settings
                </h2>
            }
        >
            <Head title="Payment Settings" />

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">

                    {/* Main Settings Card */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-bold text-zinc-900 mb-6">ToyyibPay Configuration</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Provider */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        Payment Provider
                                    </label>
                                    <select
                                        value={data.provider}
                                        onChange={(e) => setData('provider', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="toyyibpay">ToyyibPay</option>
                                    </select>
                                </div>

                                {/* Sandbox Mode */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.is_sandbox}
                                        onChange={(e) => setData('is_sandbox', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300 rounded"
                                    />
                                    <label className="text-sm font-medium text-zinc-700">
                                        Sandbox Mode (Development)
                                    </label>
                                </div>

                                {data.is_sandbox && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <p className="text-sm text-amber-800">
                                            <strong>Sandbox Mode:</strong> Register at{' '}
                                            <a href="https://dev.toyyibpay.com" target="_blank" rel="noopener noreferrer" className="underline">
                                                dev.toyyibpay.com
                                            </a>{' '}
                                            to get your sandbox credentials.
                                        </p>
                                    </div>
                                )}

                                {/* Secret Key */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        User Secret Key *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.secret_key}
                                        onChange={(e) => setData('secret_key', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                        placeholder="e.g., w5x7srq7-rx5r-3t89-2ou2-k7361x2jewhn"
                                        required
                                    />
                                    {errors.secret_key && <p className="text-red-500 text-xs mt-1">{errors.secret_key}</p>}
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Get this from your ToyyibPay account settings
                                    </p>
                                </div>

                                {/* Category Code */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-zinc-700">
                                            Category Code
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowCategoryModal(true)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            + Create Category
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.category_code}
                                        onChange={(e) => setData('category_code', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                        placeholder="e.g., j0tzqhka"
                                    />
                                    {errors.category_code && <p className="text-red-500 text-xs mt-1">{errors.category_code}</p>}
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Category groups your bills together
                                    </p>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300 rounded"
                                    />
                                    <label className="text-sm font-medium text-zinc-700">
                                        Enable Payment Gateway
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Bayarcash Configuration Card */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-bold text-zinc-900 mb-6">Bayarcash Configuration</h3>

                        <div className="space-y-6">
                            {/* Sandbox Mode */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.bayarcash_is_sandbox}
                                    onChange={(e) => setData('bayarcash_is_sandbox', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300 rounded"
                                />
                                <label className="text-sm font-medium text-zinc-700">
                                    Sandbox Mode (Development)
                                </label>
                            </div>

                            {data.bayarcash_is_sandbox && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p className="text-sm text-amber-800">
                                        <strong>Sandbox Mode:</strong> Register at{' '}
                                        <a href="https://console.bayarcash-sandbox.com" target="_blank" rel="noopener noreferrer" className="underline">
                                            console.bayarcash-sandbox.com
                                        </a>{' '}
                                        to get your sandbox credentials.
                                    </p>
                                </div>
                            )}

                            {/* Access Token */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Personal Access Token *
                                </label>
                                <input
                                    type="text"
                                    value={data.bayarcash_access_token}
                                    onChange={(e) => setData('bayarcash_access_token', e.target.value)}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    placeholder="e.g., your_personal_access_token"
                                />
                                {errors.bayarcash_access_token && <p className="text-red-500 text-xs mt-1">{errors.bayarcash_access_token}</p>}
                                <p className="text-xs text-zinc-500 mt-1">
                                    Get this from your Bayarcash console settings
                                </p>
                            </div>

                            {/* Portal Key */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Portal Key *
                                </label>
                                <input
                                    type="text"
                                    value={data.bayarcash_portal_key}
                                    onChange={(e) => setData('bayarcash_portal_key', e.target.value)}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    placeholder="e.g., your_portal_key"
                                />
                                {errors.bayarcash_portal_key && <p className="text-red-500 text-xs mt-1">{errors.bayarcash_portal_key}</p>}
                                <p className="text-xs text-zinc-500 mt-1">
                                    Portal key from your Bayarcash portal settings
                                </p>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.bayarcash_is_active}
                                    onChange={(e) => setData('bayarcash_is_active', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300 rounded"
                                />
                                <label className="text-sm font-medium text-zinc-700">
                                    Enable Bayarcash Payment Gateway
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* SenangPay Configuration Card */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-bold text-zinc-900 mb-6">SenangPay Configuration</h3>

                        <div className="space-y-6">
                            {/* Sandbox Mode */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.senangpay_is_sandbox}
                                    onChange={(e) => setData('senangpay_is_sandbox', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300 rounded"
                                />
                                <label className="text-sm font-medium text-zinc-700">
                                    Sandbox Mode (Development)
                                </label>
                            </div>

                            {data.senangpay_is_sandbox && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p className="text-sm text-amber-800">
                                        <strong>Sandbox Mode:</strong> Use sandbox credentials from{' '}
                                        <a href="https://app.senangpay.my" target="_blank" rel="noopener noreferrer" className="underline">
                                            app.senangpay.my
                                        </a>{' '}
                                        for testing.
                                    </p>
                                </div>
                            )}

                            {/* Merchant ID */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Merchant ID *
                                </label>
                                <input
                                    type="text"
                                    value={data.senangpay_merchant_id}
                                    onChange={(e) => setData('senangpay_merchant_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    placeholder="e.g., 123456789012345"
                                />
                                {errors.senangpay_merchant_id && <p className="text-red-500 text-xs mt-1">{errors.senangpay_merchant_id}</p>}
                                <p className="text-xs text-zinc-500 mt-1">
                                    Get this from Menu → Settings → Profile in your SenangPay dashboard
                                </p>
                            </div>

                            {/* Secret Key */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Secret Key *
                                </label>
                                <input
                                    type="text"
                                    value={data.senangpay_secret_key}
                                    onChange={(e) => setData('senangpay_secret_key', e.target.value)}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    placeholder="e.g., your_secret_key"
                                />
                                {errors.senangpay_secret_key && <p className="text-red-500 text-xs mt-1">{errors.senangpay_secret_key}</p>}
                                <p className="text-xs text-zinc-500 mt-1">
                                    Keep this secret! Used for hash generation and verification
                                </p>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.senangpay_is_active}
                                    onChange={(e) => setData('senangpay_is_active', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300 rounded"
                                />
                                <label className="text-sm font-medium text-zinc-700">
                                    Enable SenangPay Payment Gateway
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm font-medium"
                            >
                                {processing ? 'Saving...' : 'Save All Settings'}
                            </button>
                            <button
                                type="button"
                                onClick={testConnection}
                                className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
                            >
                                Test Connection
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Create ToyyibPay Category</h3>

                        <form onSubmit={handleCreateCategory}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={categoryForm.data.catname}
                                        onChange={(e) => categoryForm.setData('catname', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="e.g., Taekwondo Fees"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Description *
                                    </label>
                                    <textarea
                                        value={categoryForm.data.catdescription}
                                        onChange={(e) => categoryForm.setData('catdescription', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        rows="3"
                                        placeholder="e.g., Monthly fees for Taekwondo classes"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryModal(false)}
                                    className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={categoryForm.processing}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm"
                                >
                                    {categoryForm.processing ? 'Creating...' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
