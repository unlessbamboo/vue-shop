import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 网站主页的导航屑列表
    tagsList: [],
  },
  mutations: {
    SET_TAGS_LIST(state, tags) {
      state.tagsList = tags;
    },
  },
  actions: {
    updateTagsList({commit}, tags) {
      commit("SET_TAGS_LIST", tags);
    },
  },
});
