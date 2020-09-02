import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators'
@Module({ namespaced: true, name: 'user' })
class User extends VuexModule {
  public name = ''

  get User(): string {
    return this.name.toLocaleUpperCase()
  }

  @Mutation
  public setName(newName: string): void {
    this.name = newName
  }
  @Action
  public updateName(newName: string): void {
    this.context.commit('setName', newName)
  }
}
export default User
