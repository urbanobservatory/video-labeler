import Vue from 'vue'
import Vuex from 'vuex'
import User from '@/store/modules/user'
import Task from '@/store/modules/task'
import Labels from '@/store/modules/labels'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    user: User,
    task: Task,
    labels: Labels
  }
})
