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
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const categories = [
      {
        id: "daily",
        name: "日常工具",
        tools: ["calculator", "unit", "currency", "qrcode", "Kingdom", "relative"]
      },
      {
        id: "finance",
        name: "理财工具",
        tools: ["mortgage", "car", "pension"]
      },
      {
        id: "life",
        name: "生活工具",
        tools: ["bmi", "pregnancy"]
      },
      {
        id: "work",
        name: "工作工具",
        tools: ["individual", "retirement", "social"]
      }
    ];
    const favoriteClickCount = common_vendor.ref(0);
    const showKingdom = common_vendor.ref(false);
    const tools = [
      {
        id: "Kingdom",
        name: "金证门禁",
        icon: "calendar-filled",
        path: "/pageSub/Kingdom-core/Kingdom-core",
        category: "daily",
        hidden: true
        // 添加hidden属性标记需要隐藏的工具
      },
      {
        id: "calculator",
        name: "计算器",
        icon: "calendar-filled",
        path: "/pageSub/Calculator/Calculator",
        category: "daily"
      },
      {
        id: "unit",
        name: "单位转换器",
        icon: "refresh",
        path: "/pageSub/Unit-converter/Unit-converter",
        category: "daily"
      },
      {
        id: "currency",
        name: "汇率转换器",
        icon: "refresh",
        path: "/pageSub/Currency-exchange/Currency-exchange",
        category: "daily"
      },
      {
        id: "qrcode",
        name: "二维码生成器",
        icon: "medal",
        path: "/pageSub/Qrcode-generator/Qrcode-generator",
        category: "daily"
      },
      {
        id: "relative",
        name: "亲戚称呼计算器",
        icon: "medal",
        path: "/pageSub/Relative-calculator/Relative-calculator",
        category: "daily"
      },
      {
        id: "mortgage",
        name: "房贷计算器",
        icon: "home",
        path: "/pageSub/Mortgage-calculator/Mortgage-calculator",
        category: "finance"
      },
      {
        id: "car",
        name: "车贷计算器",
        icon: "cart-filled",
        path: "/pageSub/Car-calculator/Car-calculator",
        category: "finance"
      },
      {
        id: "pension",
        name: "养老金计算器",
        icon: "wallet-filled",
        path: "/pageSub/Pension-calculator/Pension-calculator",
        category: "finance"
      },
      {
        id: "bmi",
        name: "BMI计算器",
        icon: "person-filled",
        path: "/pageSub/BMI/BMI",
        category: "life"
      },
      {
        id: "pregnancy",
        name: "孕期计算器",
        icon: "heart-filled",
        path: "/pageSub/Pregnancy-calculator/Pregnancy-calculator",
        category: "life"
      },
      {
        id: "individual",
        name: "个税计算器",
        icon: "wallet",
        path: "/pageSub/Individual-calculator/Individual-calculator",
        category: "work"
      },
      {
        id: "retirement",
        name: "退休年龄",
        icon: "calendar",
        path: "/pageSub/Retirement-age/Retirement-age",
        category: "work"
      },
      {
        id: "social",
        name: "社保年限",
        icon: "medal",
        path: "/pageSub/Social-security-period/Social-security-period",
        category: "work"
      }
    ];
    const getToolsByCategory = (categoryId) => {
      return tools.filter((tool) => tool.category === categoryId).filter(
        (tool) => !tool.hidden || tool.id === "Kingdom" && showKingdom.value
      );
    };
    const favorites = common_vendor.ref([]);
    const showAllFavorites = common_vendor.ref(false);
    const displayedFavorites = common_vendor.computed(() => {
      return showAllFavorites.value ? favorites.value : favorites.value.slice(0, 6);
    });
    const isFavorite = (id) => {
      return favorites.value.some((item) => item.id === id);
    };
    const saveFavorites = () => {
      common_vendor.index.setStorageSync("favorites", favorites.value);
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
      }
    };
    const handleAdd = (tool) => {
      if (!isFavorite(tool.id)) {
        favorites.value.push(tool);
        saveFavorites();
      }
    };
    const toggleShowMore = () => {
      showAllFavorites.value = !showAllFavorites.value;
    };
    const dragStartIndex = common_vendor.ref(-1);
    const dragEndIndex = common_vendor.ref(-1);
    const dragStartY = common_vendor.ref(0);
    const itemHeight = common_vendor.ref(0);
    const startDrag = (e, index) => {
      dragStartIndex.value = index;
      dragStartY.value = e.touches[0].pageY;
      common_vendor.index.createSelectorQuery().select(".tool-item").boundingClientRect((rect) => {
        itemHeight.value = rect.height;
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
    };
    const endDrag = () => {
      if (dragStartIndex.value !== -1) {
        saveFavorites();
        common_vendor.index.vibrateShort();
      }
      dragStartIndex.value = -1;
      dragEndIndex.value = -1;
    };
    const handleItemClick = (item) => {
      common_vendor.index.navigateTo({
        url: item.path,
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:398", "导航失败:", err);
          common_vendor.index.showToast({
            title: "页面跳转失败",
            icon: "none"
          });
        }
      });
    };
    common_vendor.onMounted(() => {
      const savedFavorites = common_vendor.index.getStorageSync("favorites");
      if (savedFavorites) {
        favorites.value = savedFavorites;
      }
      if (favorites.value.some((item) => item.id === "Kingdom")) {
        showKingdom.value = true;
      }
    });
    const searchKeyword = common_vendor.ref("");
    const searchResults = common_vendor.computed(() => {
      if (!searchKeyword.value)
        return [];
      return tools.filter(
        (tool) => !tool.hidden || tool.id === "Kingdom" && showKingdom.value
      ).filter(
        (tool) => tool.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
      );
    });
    const handleSearch = () => {
      if (!searchKeyword.value) {
        searchResults.value = [];
        return;
      }
      const keyword = searchKeyword.value.toLowerCase();
      searchResults.value = tools.filter(
        (tool) => tool.name.toLowerCase().includes(keyword) || tool.id.toLowerCase().includes(keyword)
      );
    };
    const clearSearch = () => {
      searchKeyword.value = "";
      searchResults.value = [];
    };
    const qrPopup = common_vendor.ref(null);
    const showQRCode = () => {
      qrPopup.value.open();
    };
    const hideQRCode = () => {
      qrPopup.value.close();
    };
    const handleFavoritesTitleClick = () => {
      favoriteClickCount.value++;
      if (favoriteClickCount.value >= 5) {
        showKingdom.value = true;
        favoriteClickCount.value = 0;
        const kingdomTool = tools.find((tool) => tool.id === "Kingdom");
        if (kingdomTool && !isFavorite(kingdomTool.id)) {
          favorites.value.push(kingdomTool);
          saveFavorites();
        }
        common_vendor.index.showToast({
          title: "已解锁金证门禁并添加到常用",
          icon: "none",
          duration: 2e3
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        b: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, handleSearch]),
        c: searchKeyword.value,
        d: searchKeyword.value
      }, searchKeyword.value ? {
        e: common_vendor.o(clearSearch),
        f: common_vendor.p({
          type: "clear",
          size: "16",
          color: "#999"
        })
      } : {}, {
        g: searchKeyword.value
      }, searchKeyword.value ? common_vendor.e({
        h: searchResults.value.length > 0
      }, searchResults.value.length > 0 ? {
        i: common_vendor.f(searchResults.value, (item, k0, i0) => {
          return common_vendor.e({
            a: "031f2ab4-2-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "30",
              color: "#1677ff"
            }),
            c: common_vendor.t(item.name),
            d: common_vendor.o(($event) => handleItemClick(item), item.id),
            e: !isFavorite(item.id)
          }, !isFavorite(item.id) ? {
            f: "031f2ab4-3-" + i0,
            g: common_vendor.p({
              type: "star",
              size: "18",
              color: "#999"
            }),
            h: common_vendor.o(($event) => handleAdd(item), item.id)
          } : {
            i: "031f2ab4-4-" + i0,
            j: common_vendor.p({
              type: "star-filled",
              size: "18",
              color: "#1677ff"
            }),
            k: common_vendor.o(($event) => handleRemove(item.id), item.id)
          }, {
            l: item.id
          });
        })
      } : {
        j: common_vendor.p({
          type: "info",
          size: "30",
          color: "#999"
        })
      }) : common_vendor.e({
        k: favorites.value.length > 0
      }, favorites.value.length > 0 ? {
        l: common_vendor.f(displayedFavorites.value, (item, index, i0) => {
          return {
            a: "031f2ab4-7-" + i0 + ",031f2ab4-6",
            b: common_vendor.p({
              type: item.icon,
              size: "30",
              color: "#1677ff"
            }),
            c: common_vendor.t(item.name),
            d: common_vendor.o(($event) => handleItemClick(item), item.id),
            e: "031f2ab4-8-" + i0 + ",031f2ab4-6",
            f: common_vendor.o(($event) => startDrag($event, index), item.id),
            g: common_vendor.o(handleDrag, item.id),
            h: common_vendor.o(endDrag, item.id),
            i: "031f2ab4-9-" + i0 + ",031f2ab4-6",
            j: common_vendor.o(($event) => handleRemove(item.id), item.id),
            k: item.id,
            l: index === dragStartIndex.value ? 1 : "",
            m: index
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
          size: "30",
          color: "#999"
        })
      }, {
        p: favorites.value.length > 6
      }, favorites.value.length > 6 ? {
        q: common_vendor.t(showAllFavorites.value ? "收起" : "查看更多"),
        r: common_vendor.p({
          type: showAllFavorites.value ? "top" : "bottom",
          size: "14"
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
                a: "031f2ab4-13-" + i0 + "-" + i1 + "," + ("031f2ab4-12-" + i0),
                b: common_vendor.p({
                  type: item.icon,
                  size: "30",
                  color: "#1677ff"
                }),
                c: common_vendor.t(item.name),
                d: common_vendor.o(($event) => handleItemClick(item), item.id),
                e: "031f2ab4-14-" + i0 + "-" + i1 + "," + ("031f2ab4-12-" + i0),
                f: common_vendor.o(($event) => handleAdd(item), item.id),
                g: item.id
              };
            }),
            b: "031f2ab4-12-" + i0,
            c: common_vendor.p({
              title: category.name,
              type: "line"
            }),
            d: category.id
          };
        }),
        x: common_vendor.p({
          type: "star",
          size: "18",
          color: "#999"
        }),
        y: common_vendor.p({
          type: "chat",
          size: "20",
          color: "#1677ff"
        }),
        z: common_vendor.o(showQRCode),
        A: common_assets._imports_0,
        B: common_vendor.o(hideQRCode),
        C: common_vendor.sr(qrPopup, "031f2ab4-16", {
          "k": "qrPopup"
        }),
        D: common_vendor.p({
          type: "center"
        })
      }));
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
