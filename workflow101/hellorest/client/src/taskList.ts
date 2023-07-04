import { LitElement, TemplateResult, html } from 'lit'
import { customElement, property} from 'lit/decorators.js'
import {Task, TaskList} from './api.ts';


@customElement('vf-task-list')
export class TaskListElement extends LitElement {
  @property({ type: String }) url = '';
  @property({ type: Array }) tasks: TaskList = [];
  @property({ type: Boolean }) loading = true;
  @property({ type: String }) error: string | undefined;

  private controller: AbortController = new AbortController();

  createRenderRoot() { return this }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.controller.abort();
  }

  updated(changedProperties: any) {
    if (changedProperties.has('url')) {
      this.fetchTasks();
    }
  }

  async fetchTasks(): Promise<void> {
    if(!this.url) {
      return
    }
    try {
      this.loading = true;
      const response = await fetch(this.url, {
        signal: this.controller.signal
      });
      if (!response.ok) {
        throw new Error('An error occurred while fetching the flow list.');
      }
      const data = await response.json();
      this.tasks = data;
      if(this.tasks) {
        this.dispatchEvent(new CustomEvent('link-clicked', { detail: this.tasks[0] }));
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred while fetching the flow list.';
    } finally {
      this.loading = false;
    }
  }

  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    const selected = this.tasks.find((task) => task.id.toString() === target.textContent) || null

    if(selected) {
      this.dispatchEvent(new CustomEvent('link-clicked', { detail: selected }));
    }
  }

  renderSpin(): TemplateResult {
    return html`
      <div class="flex justify-center items-center py-4 animate-spin-container">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    `
  }

  renderTableRow(task: Task): TemplateResult {
    return html`
      <tr>
        <td class="py-3 px-4 border-b border-gray-200 text-sm">
          <a href="#" @click=${this.handleClick}>${task.id}</a>
        </td>
        <td class="py-3 px-4 border-b border-gray-200 text-sm">${task.status}</td>
        <td class="py-3 px-4 border-b border-gray-200 text-sm">${task.brief}</td>
        <td class="py-3 px-4 border-b border-gray-200 text-sm">${task.process_brief}</td>
        <td class="py-3 px-4 border-b border-gray-200 text-sm">${new Date(task.created).toLocaleString()}</td>
      </tr>
    `
  }

  renderTable(): TemplateResult {
    return html`
      <div class="container mx-auto py-2 px-2">
        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr>
            <th class="py-3 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm">#</th>
              <th class="py-3 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm">Status</th>
              <th class="py-3 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm">Task</th>
              <th class="py-3 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm">Process Brief</th>
              <th class="py-3 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm">Created</th>
            </tr>
          </thead>
          <tbody>
            ${this.tasks.map((task) => this.renderTableRow(task))}
          </tbody>
        </table>
      </div>
    `;
  }

  renderErrorMessage(): TemplateResult {
    return html`
      <div class="mt-4 text-red-500 error-message px-2">
        ${this.error}
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div class="bg-gray-500 text-white py-4">
        <h1 class="text-2xl text-center">Tasks</h1>
      </div>

      ${this.loading ? this.renderSpin() : this.renderTable()}
      ${this.error ? this.renderErrorMessage() : ''}
    `;
  }
}
