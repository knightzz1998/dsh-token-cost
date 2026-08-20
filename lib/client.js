window.__ModuleLoader__.load({
	id: "dsh-token-cost",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		let primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region dsh-token-cost/TokenCostPill.module.css
		const css = ".tokenCost_root{position:relative;display:inline-flex}.tokenCost_trigger{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:999px;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:12px;font-weight:500;line-height:20px;font-variant-numeric:tabular-nums}.tokenCost_trigger:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.tokenCost_dot{width:8px;height:8px;border-radius:999px;flex:none}.tokenCost_dotPeak{background:var(--dsw-alias-state-error-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-error-primary) 22%,transparent)}.tokenCost_dotOffPeak{background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-state-success-primary) 22%,transparent)}.tokenCost_glyph{color:var(--dsw-alias-label-tertiary);display:inline-flex}.tokenCost_amount{color:var(--dsw-alias-label-primary)}.tokenCost_panel{position:absolute;top:calc(100% + 8px);right:0;z-index:100;box-sizing:border-box;width:288px;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-secondary);cursor:default;border-radius:12px;padding:12px;font-size:12px;line-height:20px}.tokenCost_header{display:flex;align-items:center;gap:6px}.tokenCost_title{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500}.tokenCost_total{margin:8px 0 10px;font-size:20px;font-weight:600;line-height:28px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}.tokenCost_totalCny{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;margin-left:6px}.tokenCost_rows{display:flex;flex-direction:column;gap:2px;padding:8px 0;border-top:1px solid var(--dsw-alias-border-l1)}.tokenCost_row{display:flex;justify-content:space-between;align-items:center;gap:12px}.tokenCost_row dt{color:var(--dsw-alias-label-secondary)}.tokenCost_row dd{margin:0;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary)}.tokenCost_meta{margin-top:8px;padding-top:8px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;gap:2px;color:var(--dsw-alias-label-tertiary);word-break:break-all}.tokenCost_rates{display:flex;flex-wrap:wrap;gap:2px 10px;color:var(--dsw-alias-label-tertiary)}.tokenCost_badge{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:999px;font-size:11px;line-height:18px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.tokenCost_badgePeak{background:var(--dsw-alias-state-warning-primary);color:var(--dsw-alias-label-inverted,var(--dsw-alias-label-primary))}.tokenCost_note{margin-top:8px;color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px}";
		const tagId = "dsh-token-cost/TokenCostPill.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-token-cost";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const styles = {
			"root": "tokenCost_root",
			"trigger": "tokenCost_trigger",
			"dot": "tokenCost_dot",
			"dotPeak": "tokenCost_dotPeak",
			"dotOffPeak": "tokenCost_dotOffPeak",
			"glyph": "tokenCost_glyph",
			"amount": "tokenCost_amount",
			"panel": "tokenCost_panel",
			"header": "tokenCost_header",
			"title": "tokenCost_title",
			"total": "tokenCost_total",
			"totalCny": "tokenCost_totalCny",
			"rows": "tokenCost_rows",
			"row": "tokenCost_row",
			"meta": "tokenCost_meta",
			"rates": "tokenCost_rates",
			"badge": "tokenCost_badge",
			"badgePeak": "tokenCost_badgePeak",
			"note": "tokenCost_note"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Dictionary namespace owned by this plugin. */
		const NS = "tokenCost";
		/** Required services: slot registration and locale copy. */
		const inject = ["slots", "locale"];
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"trigger.aria": "本会话 token 费用",
			"title": "本会话 Token 费用",
			"row.uncachedInput": "未缓存输入",
			"row.cacheRead": "缓存读取",
			"row.cacheWrite": "缓存写入",
			"row.output": "输出",
			"row.totalTokens": "Token 合计",
			"model": "模型",
			"status.title": "当前时段",
			"status.peak": "价格高峰",
			"status.offPeak": "非高峰",
			"rates.title": "计价（每 1M token）",
			"rates.peak": "高峰",
			"rates.offPeak": "非高峰",
			"note": "价格在 ~/.dsh/profiles/web/cordis.patch.yml 中配置"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"trigger.aria": "This session's token cost",
			"title": "Session token cost",
			"row.uncachedInput": "Uncached input",
			"row.cacheRead": "Cache read",
			"row.cacheWrite": "Cache write",
			"row.output": "Output",
			"row.totalTokens": "Total tokens",
			"model": "Model",
			"status.title": "Current period",
			"status.peak": "Peak pricing",
			"status.offPeak": "Off-peak",
			"rates.title": "Rates (per 1M tokens)",
			"rates.peak": "peak",
			"rates.offPeak": "off-peak",
			"note": "Prices are configured in ~/.dsh/profiles/web/cordis.patch.yml"
		};
		/** Currency symbol for display; falls back to the raw code. */
		function currencySymbol(currency) {
			if (currency === "USD") return "$";
			if (currency === "CNY") return "¥";
			return `${currency} `;
		}
		/** Compact USD amount with adaptive precision. */
		function formatUsd(usd) {
			if (!(usd > 0)) return "0.00";
			if (usd < 0.01) return usd.toFixed(4);
			if (usd < 1) return usd.toFixed(3);
			return usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		}
		/** Compact token count: 16.4K / 1.2M. */
		function formatTokens(n) {
			if (n >= 1e6) return `${(n / 1e6).toFixed(2).replace(/\.?0+$/, "")}M`;
			if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
			return String(n);
		}
		/** Per-million rate line, e.g. "输入 $0.44/M". */
		function formatRate(label, rate, symbol) {
			return `${label} ${symbol}${rate < 0.01 ? rate.toFixed(3) : rate.toFixed(2)}/M`;
		}
		/** Whether the LOCAL hour right now falls inside a peak window (live status for the indicator dot). */
		function isPeakNow(peakHours, now = Date.now()) {
			if (!Array.isArray(peakHours) || peakHours.length === 0) return false;
			const hour = new Date(now).getHours();
			return peakHours.some(([start, end]) => hour >= start && hour < end);
		}
		/**
		* Session-header token cost pill. Renders nothing until the host projection
		* carries at least one usage sample; then shows the cumulative spend, with a
		* click popover for the token breakdown, model, and applied rates. The
		* `tokenCost` projection pushes frames while a turn streams, so the amount
		* updates live.
		* @param props - framework session kit plus the namespace translator.
		* @returns the pill, or null when there is nothing to show.
		*/
		function TokenCostPill({ sessionId, useProjection, t }) {
			const cost = useProjection("tokenCost");
			const [open, setOpen] = react.useState(false);
			const [peakNow, setPeakNow] = react.useState(() => isPeakNow(cost?.peakHours));
			const rootRef = react.useRef(null);
			const tokens = cost?.tokens;
			const hasData = cost !== undefined && tokens !== undefined && (tokens.uncachedInput > 0 || tokens.output > 0);
			(0, react.useEffect)(() => {
				if (!hasData) return;
				const update = () => setPeakNow(isPeakNow(cost?.peakHours));
				update();
				const timer = setInterval(update, 30_000);
				return () => clearInterval(timer);
			}, [hasData, cost?.peakHours]);
			(0, react.useEffect)(() => {
				if (!hasData && open) setOpen(false);
			}, [hasData, open]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onPointerDown = (event) => {
					if (event.target instanceof Node && rootRef.current?.contains(event.target) === true) return;
					setOpen(false);
				};
				const onKeyDown = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				document.addEventListener("pointerdown", onPointerDown);
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown);
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [open]);
			if (!hasData) return null;
			const symbol = currencySymbol(cost.currency);
			const amount = formatUsd(cost.costUsd);
			const totalTokens = tokens.uncachedInput + tokens.cacheRead + tokens.cacheWrite + tokens.output;
			const cny = cost.cnyUsdRate > 0 ? cost.costUsd * cost.cnyUsdRate : null;
			const rows = [
				{ key: "uncachedInput", label: t("row.uncachedInput"), value: formatTokens(tokens.uncachedInput) },
				{ key: "cacheRead", label: t("row.cacheRead"), value: formatTokens(tokens.cacheRead) },
				{ key: "output", label: t("row.output"), value: formatTokens(tokens.output) }
			];
			if (tokens.cacheWrite > 0) rows.splice(2, 0, { key: "cacheWrite", label: t("row.cacheWrite"), value: formatTokens(tokens.cacheWrite) });
			rows.push({ key: "total", label: t("row.totalTokens"), value: formatTokens(totalTokens) });
			const model = cost.model !== null && cost.model !== "" ? `${cost.provider}/${cost.model}` : null;
			const rates = cost.rates;
			const peakBadge = t(cost.peak ? "rates.peak" : "rates.offPeak");
			const statusText = peakNow ? t("status.peak") : t("status.offPeak");
			return (0, react_jsx_runtime.jsx)("div", {
				ref: rootRef,
				className: styles.root,
				children: [
					(0, react_jsx_runtime.jsx)(primitives.Tooltip, {
						label: `${symbol}${amount}${model !== null ? ` · ${model}` : ""} · ${statusText}`,
						side: "bottom",
						delayMs: 500,
						children: (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: styles.trigger,
							"aria-label": `${t("trigger.aria")}，${statusText}`,
							"aria-expanded": open,
							onClick: () => setOpen((current) => !current),
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: `${styles.dot} ${peakNow ? styles.dotPeak : styles.dotOffPeak}`,
									"aria-hidden": true
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: styles.glyph,
									children: (0, react_jsx_runtime.jsx)(primitives.IconDataOutline16, { size: 12 })
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: styles.amount,
									children: `${symbol}${amount}`
								})
							]
						})
					}),
					open ? (0, react_jsx_runtime.jsx)("div", {
						className: styles.panel,
						role: "dialog",
						"aria-label": t("title"),
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: styles.header,
								children: (0, react_jsx_runtime.jsx)("span", {
									className: styles.title,
									children: t("title")
								})
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: styles.total,
								children: [
									`${symbol}${amount}`,
									cny !== null ? (0, react_jsx_runtime.jsx)("span", {
										className: styles.totalCny,
										children: `≈ ¥${cny.toFixed(2)}`
									}) : null
								]
							}),
							(0, react_jsx_runtime.jsx)("dl", {
								className: styles.rows,
								children: rows.map((row) => (0, react_jsx_runtime.jsxs)(react.Fragment, {
									key: row.key,
									children: [
										(0, react_jsx_runtime.jsx)("div", {
											className: styles.row,
											children: [
												(0, react_jsx_runtime.jsx)("dt", { children: row.label }),
												(0, react_jsx_runtime.jsx)("dd", { children: row.value })
											]
										})
									]
								}))
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: styles.meta,
								children: [
									model !== null ? (0, react_jsx_runtime.jsxs)("div", {
										className: styles.row,
										children: [
											(0, react_jsx_runtime.jsx)("dt", { children: t("model") }),
											(0, react_jsx_runtime.jsx)("dd", { children: model })
										]
									}) : null,
									(0, react_jsx_runtime.jsxs)("div", {
										className: styles.row,
										children: [
											(0, react_jsx_runtime.jsx)("dt", { children: t("status.title") }),
											(0, react_jsx_runtime.jsx)("dd", { children: statusText })
										]
									}),
									rates !== null ? (0, react_jsx_runtime.jsxs)("div", {
										children: [
											(0, react_jsx_runtime.jsxs)("div", {
												className: styles.rates,
												children: [
													formatRate(t("row.uncachedInput"), rates.input, symbol),
													formatRate(t("row.cacheRead"), rates.cacheRead, symbol),
													formatRate(t("row.output"), rates.output, symbol)
												]
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: `${styles.badge}${cost.peak ? ` ${styles.badgePeak}` : ""}`,
												children: peakBadge
											})
										]
									}) : null
								]
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: styles.note,
								children: t("note")
							})
						]
					}) : null
				]
			});
		}
		/**
		* Client plugin body: register the dictionaries and the session-header pill.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-token-cost: dictionaries");
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "token-cost",
				order: 20,
				locale: NS
			}, TokenCostPill));
		}
		//#endregion
		exports.TokenCostPill = TokenCostPill;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
