import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators'
import { Label } from '../../types'
@Module({ namespaced: true })
class Labels extends VuexModule {
  public allLabels: Label[] = []

  @Mutation
  public setLabels(labels: Label[]): void {
    this.allLabels = labels
  }
  @Mutation
  public changeLabels(labels: Label[]): void {
    //TODO: always save to API
    labels.forEach(label => {
      const existing = this.allLabels.find(l => l.labelId === label.labelId)
      if (existing) {
        Object.assign(existing, label)
      } else {
        this.allLabels.push(label)
      }
    })
  }

  @Action
  public updateLabels(newLabels: Label[]): void {
    this.context.commit('setLabels', newLabels)
  }
}
export default Labels
