import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function formatDate(value) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }).format(new Date(value));
}
export function OrderHistoryPage({ orders, isLoading, isError, onOpenOrder, onContinueShopping }) {
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalUnits = orders.reduce((sum, order) => sum + order.totalQuantity, 0);
    return (_jsx("main", { className: "gg-page", children: _jsxs("section", { className: "gg-panel", children: [_jsx("p", { className: "gg-kicker", children: "Orders" }), _jsx("h2", { className: "mt-2 font-display text-3xl text-white", children: "Order History" }), !isLoading && !isError && orders.length > 0 ? (_jsxs("div", { className: "mt-3 grid gap-2 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-300 sm:grid-cols-3", children: [_jsxs("p", { children: ["Orders placed: ", _jsx("span", { className: "font-semibold text-white", children: orders.length })] }), _jsxs("p", { children: ["Total items: ", _jsx("span", { className: "font-semibold text-white", children: totalUnits })] }), _jsxs("p", { children: ["Lifetime spend: ", _jsxs("span", { className: "font-semibold text-white", children: ["$", totalSpent.toFixed(2)] })] })] })) : null, isLoading ? _jsx("p", { className: "mt-4 text-zinc-300", children: "Loading orders..." }) : null, isError ? _jsx("p", { className: "mt-4 text-zinc-300", children: "Unable to load orders right now." }) : null, !isLoading && !isError ? (_jsx("div", { className: "mt-5 space-y-3", children: orders.length === 0 ? (_jsxs("div", { className: "rounded-xl border border-white/10 bg-black/20 p-5", children: [_jsx("p", { className: "text-zinc-300", children: "No orders yet." }), _jsx("button", { className: "gg-btn-secondary mt-3 w-full sm:w-auto", onClick: onContinueShopping, type: "button", children: "Continue Shopping" })] })) : (orders.map((order) => (_jsx("article", { className: "rounded-xl border border-white/10 bg-black/20 p-3", children: _jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm text-zinc-400", children: ["Order #", order.id.slice(0, 8)] }), _jsx("p", { className: "text-sm text-zinc-300", children: formatDate(order.createdAt) }), _jsxs("p", { className: "text-sm text-zinc-300", children: [order.totalQuantity, " items across ", order.lineItemCount, " lines"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold text-white", children: ["$", order.totalAmount.toFixed(2)] }), _jsx("button", { className: "gg-btn-secondary mt-2 w-full sm:w-auto", onClick: () => onOpenOrder(order.id), type: "button", children: "View details" })] })] }) }, order.id)))) })) : null] }) }));
}
