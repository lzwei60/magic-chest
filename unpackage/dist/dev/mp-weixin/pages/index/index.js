"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_section2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
const _easycom_uni_section = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-section/uni-section.js";
const _easycom_uni_popup = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_section + _easycom_uni_popup)();
}
const KINGDOM_UNLOCK_CLICKS = 5;
const FAVORITES_DISPLAY_LIMIT = 6;
const STORAGE_KEY_FAVORITES = "favorites";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const categories = [
      {
        id: "daily",
        name: "日常工具",
        tools: ["Kingdom", "calculator", "unit", "qrcode", "relative"]
      },
      {
        id: "finance",
        name: "理财工具",
        tools: ["mortgage", "car", "pension"]
      },
      {
        id: "life",
        name: "生活工具",
        tools: ["bmi", "currency", "pregnancy"]
      },
      {
        id: "work",
        name: "工作工具",
        tools: ["individual", "retirement", "social"]
      },
      {
        id: "data",
        name: "数据工具",
        tools: ["deduplication"]
      },
      {
        id: "time",
        name: "时间工具",
        tools: ["dateCalculation", "timezoneConverter", "countdown"]
      }
    ];
    const favoriteClickCount = common_vendor.ref(0);
    const showKingdom = common_vendor.ref(false);
    const defaultTools = common_vendor.ref([
      {
        id: "Kingdom",
        name: "金证门禁",
        icon: "calendar-filled",
        path: "/pageSub/KingdomCore/Kingdom-core",
        category: "daily",
        hidden: true
        // 添加hidden属性标记需要隐藏的工具
      }
    ]);
    const dailyTools = common_vendor.ref([
      {
        id: "calculator",
        name: "计算器",
        icon: "calendar-filled",
        path: "/pageSub/DailyTools/Calculator/Calculator",
        category: "daily"
      },
      {
        id: "unit",
        name: "单位转换器",
        icon: "refresh",
        path: "/pageSub/DailyTools/UnitConverter/Unit-converter",
        category: "daily"
      },
      {
        id: "currency",
        name: "汇率转换器",
        icon: "refresh",
        path: "/pageSub/DailyTools/CurrencyExchange/Currency-exchange",
        category: "daily"
      },
      {
        id: "qrcode",
        name: "二维码生成器",
        icon: "medal",
        path: "/pageSub/DailyTools/QrcodeGenerator/Qrcode-generator",
        category: "daily"
      },
      {
        id: "relative",
        name: "亲戚称呼计算器",
        icon: "medal",
        path: "/pageSub/DailyTools/RelativeCalculator/Relative-calculator",
        category: "daily"
      }
    ]);
    const financeTools = common_vendor.ref([
      {
        id: "mortgage",
        name: "房贷计算器",
        icon: "home",
        path: "/pageSub/FinanceTools/MortgageCalculator/Mortgage-calculator",
        category: "finance"
      },
      {
        id: "car",
        name: "车贷计算器",
        icon: "cart-filled",
        path: "/pageSub/FinanceTools/CarCalculator/Car-calculator",
        category: "finance"
      },
      {
        id: "pension",
        name: "养老金计算器",
        icon: "wallet-filled",
        path: "/pageSub/FinanceTools/PensionCalculator/Pension-calculator",
        category: "finance"
      }
    ]);
    const lifeTools = common_vendor.ref([
      {
        id: "bmi",
        name: "BMI计算器",
        icon: "person-filled",
        path: "/pageSub/LifeTools/BMI/BMI",
        category: "life"
      },
      {
        id: "pregnancy",
        name: "孕期计算器",
        icon: "heart-filled",
        path: "/pageSub/LifeTools/PregnancyCalculator/Pregnancy-calculator",
        category: "life"
      },
      {
        id: "habit",
        name: "打卡器",
        icon: "wallet",
        path: "/pageSub/LifeTools/Habit/Habit",
        category: "life"
      }
    ]);
    const workTools = common_vendor.ref([
      {
        id: "individual",
        name: "个税计算器",
        icon: "wallet",
        path: "/pageSub/WorkTools/IndividualCalculator/Individual-calculator",
        category: "work"
      },
      {
        id: "retirement",
        name: "退休年龄",
        icon: "calendar",
        path: "/pageSub/WorkTools/RetirementAge/Retirement-age",
        category: "work"
      },
      {
        id: "social",
        name: "社保年限",
        icon: "medal",
        path: "/pageSub/WorkTools/SocialSecurityPeriod/Social-security-period",
        category: "work"
      }
    ]);
    const dataTools = common_vendor.ref([
      {
        id: "deduplication",
        name: "文本去重",
        icon: "compose",
        path: "/pageSub/DataTools/TextDeduplication/Text-deduplication",
        category: "data"
      }
    ]);
    const timeTools = common_vendor.ref([
      {
        id: "dateCalculation",
        name: "日期计算器",
        icon: "calendar",
        path: "/pageSub/TimeTools/DateCalculation/Date-calculation",
        category: "time"
      },
      {
        id: "timezoneConverter",
        name: "时区转换器",
        icon: "refreshempty",
        path: "/pageSub/TimeTools/TimezoneConverter/TimezoneConverter",
        category: "time"
      },
      {
        id: "countdown",
        name: "倒计时",
        icon: "notification",
        path: "/pageSub/TimeTools/Countdown/Countdown",
        category: "time"
      }
    ]);
    const tools = common_vendor.computed(() => [
      ...defaultTools.value,
      ...dailyTools.value,
      ...financeTools.value,
      ...lifeTools.value,
      ...workTools.value,
      ...dataTools.value,
      ...timeTools.value
    ]);
    const getToolsByCategory = (categoryId) => {
      const allTools = common_vendor.unref(tools);
      return allTools.filter(
        (tool) => tool.category === categoryId && (!tool.hidden || tool.id === "Kingdom" && showKingdom.value)
      );
    };
    const favorites = common_vendor.ref([]);
    const showAllFavorites = common_vendor.ref(false);
    const displayedFavorites = common_vendor.computed(() => {
      return showAllFavorites.value ? favorites.value : favorites.value.slice(0, FAVORITES_DISPLAY_LIMIT);
    });
    const isFavorite = (id) => {
      return favorites.value.some((item) => item.id === id);
    };
    const saveFavorites = () => {
      try {
        common_vendor.index.setStorageSync(STORAGE_KEY_FAVORITES, favorites.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:412", "保存收藏失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      }
    };
    const toggleFavorite = (tool) => {
      if (isFavorite(tool.id)) {
        handleRemove(tool.id);
      } else {
        handleAdd(tool);
      }
    };
    const handleRemove = (id) => {
      const index = favorites.value.findIndex((item) => item.id === id);
      if (index > -1) {
        favorites.value.splice(index, 1);
        saveFavorites();
        if (id === "Kingdom") {
          showKingdom.value = false;
          favoriteClickCount.value = 0;
        }
        common_vendor.index.showToast({
          title: "已移除",
          icon: "success",
          duration: 1500
        });
      }
    };
    const handleAdd = (tool) => {
      if (!isFavorite(tool.id)) {
        favorites.value.push(tool);
        saveFavorites();
        common_vendor.index.showToast({
          title: "已添加",
          icon: "success",
          duration: 1500
        });
      }
    };
    const toggleShowMore = () => {
      showAllFavorites.value = !showAllFavorites.value;
    };
    const dragStartIndex = common_vendor.ref(-1);
    const dragEndIndex = common_vendor.ref(-1);
    const dragStartY = common_vendor.ref(0);
    const itemHeight = common_vendor.ref(0);
    const dragOffset = common_vendor.ref(0);
    const getDragStyle = (index) => {
      if (index === dragStartIndex.value && dragOffset.value !== 0) {
        return {
          transform: `translateY(${dragOffset.value}px)`
        };
      }
      return {};
    };
    const startDrag = (e, index) => {
      dragStartIndex.value = index;
      dragStartY.value = e.touches[0].pageY;
      dragOffset.value = 0;
      const query = common_vendor.index.createSelectorQuery();
      query.selectAll(".favorite-item").boundingClientRect((rects) => {
        if (rects && rects.length > 0) {
          itemHeight.value = rects[0].height || 120;
        }
      }).exec();
    };
    const handleDrag = (e) => {
      if (dragStartIndex.value === -1)
        return;
      const currentY = e.touches[0].pageY;
      const moveDistance = currentY - dragStartY.value;
      const moveItems = Math.round(moveDistance / itemHeight.value);
      let newIndex = dragStartIndex.value + moveItems;
      newIndex = Math.max(0, Math.min(newIndex, favorites.value.length - 1));
      if (newIndex !== dragEndIndex.value) {
        dragEndIndex.value = newIndex;
        const item = favorites.value[dragStartIndex.value];
        favorites.value.splice(dragStartIndex.value, 1);
        favorites.value.splice(newIndex, 0, item);
        dragStartIndex.value = newIndex;
        dragStartY.value = currentY;
      }
      dragOffset.value = moveDistance % itemHeight.value;
    };
    const endDrag = () => {
      if (dragStartIndex.value !== -1) {
        saveFavorites();
      }
      dragStartIndex.value = -1;
      dragEndIndex.value = -1;
      dragOffset.value = 0;
    };
    const handleItemClick = (item) => {
      common_vendor.index.navigateTo({
        url: item.path,
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:546", "导航失败:", err);
          common_vendor.index.showToast({
            title: "页面跳转失败",
            icon: "none"
          });
        }
      });
    };
    const searchKeyword = common_vendor.ref("");
    const searchResults = common_vendor.computed(() => {
      if (!searchKeyword.value.trim())
        return [];
      const keyword = searchKeyword.value.toLowerCase().trim();
      const allTools = common_vendor.unref(tools);
      return allTools.filter(
        (tool) => !tool.hidden || tool.id === "Kingdom" && showKingdom.value
      ).filter(
        (tool) => tool.name.toLowerCase().includes(keyword) || tool.id.toLowerCase().includes(keyword)
      );
    });
    const clearSearch = () => {
      searchKeyword.value = "";
    };
    const qrPopup = common_vendor.ref(null);
    const showQRCode = () => {
      var _a;
      (_a = qrPopup.value) == null ? void 0 : _a.open();
    };
    const hideQRCode = () => {
      var _a;
      (_a = qrPopup.value) == null ? void 0 : _a.close();
    };
    const handleFavoritesTitleClick = () => {
      favoriteClickCount.value++;
      if (favoriteClickCount.value >= KINGDOM_UNLOCK_CLICKS) {
        showKingdom.value = true;
        favoriteClickCount.value = 0;
        const kingdomTool = common_vendor.unref(tools).find((tool) => tool.id === "Kingdom");
        if (kingdomTool && !isFavorite(kingdomTool.id)) {
          favorites.value.push(kingdomTool);
          saveFavorites();
        }
        common_vendor.index.showToast({
          title: "已解锁金证门禁并添加到常用",
          icon: "success",
          duration: 2e3
        });
      }
    };
    common_vendor.onMounted(() => {
      try {
        const savedFavorites = common_vendor.index.getStorageSync(STORAGE_KEY_FAVORITES);
        if (savedFavorites && Array.isArray(savedFavorites)) {
          favorites.value = savedFavorites;
        }
        if (favorites.value.some((item) => item.id === "Kingdom")) {
          showKingdom.value = true;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:624", "加载收藏失败:", error);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        b: searchKeyword.value,
        c: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        d: searchKeyword.value
      }, searchKeyword.value ? {
        e: common_vendor.o(clearSearch),
        f: common_vendor.p({
          type: "clear",
          size: "18",
          color: "#999"
        })
      } : {}, {
        g: searchKeyword.value
      }, searchKeyword.value ? common_vendor.e({
        h: searchResults.value.length > 0
      }, searchResults.value.length > 0 ? {
        i: common_vendor.f(searchResults.value, (item, k0, i0) => {
          return {
            a: "031f2ab4-2-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "32",
              color: "#1677ff"
            }),
            c: common_vendor.t(item.name),
            d: "031f2ab4-3-" + i0,
            e: common_vendor.p({
              type: isFavorite(item.id) ? "star-filled" : "star",
              size: "18",
              color: isFavorite(item.id) ? "#1677ff" : "#999"
            }),
            f: isFavorite(item.id) ? 1 : "",
            g: common_vendor.o(($event) => toggleFavorite(item), item.id),
            h: item.id,
            i: common_vendor.o(($event) => handleItemClick(item), item.id)
          };
        })
      } : {
        j: common_vendor.p({
          type: "info",
          size: "40",
          color: "#ccc"
        })
      }) : common_vendor.e({
        k: favorites.value.length > 0
      }, favorites.value.length > 0 ? {
        l: common_vendor.f(displayedFavorites.value, (item, index, i0) => {
          return {
            a: "031f2ab4-6-" + i0 + ",031f2ab4-5",
            b: common_vendor.p({
              type: item.icon,
              size: "32",
              color: "#1677ff"
            }),
            c: common_vendor.t(item.name),
            d: common_vendor.o(($event) => handleItemClick(item), `${item.id}-${index}`),
            e: "031f2ab4-7-" + i0 + ",031f2ab4-5",
            f: common_vendor.o(($event) => startDrag($event, index), `${item.id}-${index}`),
            g: common_vendor.o(handleDrag, `${item.id}-${index}`),
            h: common_vendor.o(endDrag, `${item.id}-${index}`),
            i: "031f2ab4-8-" + i0 + ",031f2ab4-5",
            j: common_vendor.o(($event) => handleRemove(item.id), `${item.id}-${index}`),
            k: `${item.id}-${index}`,
            l: index === dragStartIndex.value ? 1 : "",
            m: common_vendor.s(getDragStyle(index))
          };
        }),
        m: common_vendor.p({
          type: "more-filled",
          size: "18",
          color: "#999"
        }),
        n: common_vendor.p({
          type: "close",
          size: "18",
          color: "#999"
        })
      } : {
        o: common_vendor.p({
          type: "info",
          size: "40",
          color: "#ccc"
        })
      }, {
        p: favorites.value.length > 6
      }, favorites.value.length > 6 ? {
        q: common_vendor.t(showAllFavorites.value ? "收起" : "查看更多"),
        r: common_vendor.p({
          type: showAllFavorites.value ? "top" : "bottom",
          size: "14",
          color: "#1677ff"
        }),
        s: common_vendor.o(toggleShowMore)
      } : {}, {
        t: common_vendor.o(handleFavoritesTitleClick),
        v: common_vendor.p({
          title: "我的常用",
          type: "line"
        }),
        w: common_vendor.f(categories, (category, k0, i0) => {
          return {
            a: common_vendor.f(getToolsByCategory(category.id), (item, k1, i1) => {
              return {
                a: "031f2ab4-12-" + i0 + "-" + i1 + "," + ("031f2ab4-11-" + i0),
                b: common_vendor.p({
                  type: item.icon,
                  size: "32",
                  color: "#1677ff"
                }),
                c: common_vendor.t(item.name),
                d: "031f2ab4-13-" + i0 + "-" + i1 + "," + ("031f2ab4-11-" + i0),
                e: common_vendor.p({
                  type: isFavorite(item.id) ? "star-filled" : "star",
                  size: "18",
                  color: isFavorite(item.id) ? "#1677ff" : "#999"
                }),
                f: isFavorite(item.id) ? 1 : "",
                g: common_vendor.o(($event) => toggleFavorite(item), item.id),
                h: item.id,
                i: common_vendor.o(($event) => handleItemClick(item), item.id)
              };
            }),
            b: "031f2ab4-11-" + i0,
            c: common_vendor.p({
              title: category.name,
              type: "line"
            }),
            d: category.id
          };
        }),
        x: common_vendor.p({
          type: "chat",
          size: "20",
          color: "#1677ff"
        }),
        y: common_vendor.o(showQRCode),
        z: common_assets._imports_0,
        A: common_vendor.o(hideQRCode),
        B: common_vendor.sr(qrPopup, "031f2ab4-15", {
          "k": "qrPopup"
        }),
        C: common_vendor.p({
          type: "center"
        })
      }));
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
