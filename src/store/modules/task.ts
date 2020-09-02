import {
  VuexModule,
  Module,
  Mutation,
  Action,
  MutationAction
} from 'vuex-module-decorators'
@Module({ namespaced: true })
class Task extends VuexModule {
  public taskId = 0
  public title = ''
  public subtitle = ''
  public source = ''
  public frequency = 0
  public options: string[] = []

  get titleUpperCase(): string {
    return this.title.toUpperCase()
  }

  get subtitleUpperCase(): string {
    return this.subtitle.toUpperCase()
  }

  @Mutation
  public setTitle(newtitle: string): void {
    this.title = newtitle
  }
  @Mutation
  public setSource(newsource: string): void {
    this.source = newsource
  }
  @Mutation
  public setOptions(newoptions: string[]): void {
    this.options = newoptions
  }

  @MutationAction({
    mutate: ['taskId', 'title', 'subtitle', 'source', 'frequency', 'options']
  })
  public async fetchTask() {
    const response = await fetch(process.env.VUE_APP_API_URL)
    return await response.json()
  }

  @Action
  public updateTitle(newtitle: string): void {
    this.context.commit('setTitle', newtitle)
  }
  @Action
  public updateOptions(newoptions: string[]): void {
    this.context.commit('setOptions', newoptions)
  }
}
export default Task
