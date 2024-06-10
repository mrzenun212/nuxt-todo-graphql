<template>
  <v-container style="max-width: 500px">
    <v-text-field
      v-model="newTask"
      label="What are you working on?"
      variant="solo"
      :error-messages="errorMessage"
      @keydown.enter="createTask"
    >
      <template v-slot:append-inner>
        <v-fade-transition>
          <v-btn
            v-show="newTask"
            icon="mdi-plus-circle"
            variant="text"
            @click="createTask"
          ></v-btn>
        </v-fade-transition>
      </template>
    </v-text-field>

    <h2 class="text-h4 text-success ps-4">
      Tasks:&nbsp;
      <v-fade-transition leave-absolute>
        <span :key="`tasks-${tasks.length}`">
          {{ tasks.length }}
        </span>
      </v-fade-transition>
    </h2>
    <div clas="d-md-flex mt-4">
      <v-btn
        class="text-subtitle-2 text-success mr-2"
        color="red"
        @click="deleteCompletedTasks"
        v-if="completedTasks > 0"
      >
        Delete Completed Tasks
      </v-btn>
      <v-btn
        class="text-subtitle-2 text-success"
        color="red"
        @click="deleteAllTasks"
        v-if="tasks.length > 0"
      >
        Delete Tasks
      </v-btn>
    </div>

    <v-divider class="mt-4"></v-divider>

    <v-row align="center" class="my-1">
      <strong class="mx-4 text-info-darken-2">
        Remaining: {{ remainingTasks }}
      </strong>

      <v-divider vertical></v-divider>

      <strong class="mx-4 text-success-darken-2">
        Completed: {{ completedTasks }}
      </strong>

      <v-spacer></v-spacer>
      
      <v-progress-circular v-model="progress" class="me-2"></v-progress-circular>
    </v-row>

    <v-divider class="mb-4"></v-divider>

    <v-card v-if="tasks.length > 0">
      <v-slide-y-transition class="py-0" tag="v-list" group>
        <template v-for="(task, i) in tasks" :key="`${i}-${task.name}`">
          <v-divider v-if="i !== 0" :key="`${i}-divider`"></v-divider>

          <v-list-item>
            <template v-slot:prepend>
              <v-checkbox-btn
                v-model="task.state"
                color="grey"
                @change="toggleTaskState(task)"
              ></v-checkbox-btn>
            </template>

            <v-list-item-title>
              <template v-if="task.editing">
                <v-text-field
                  v-model="task.editName"
                  solo
                  hide-details
                  :error-messages="editingErrorMessages"
                ></v-text-field>
              </template>
              <template v-else>
                <span :class="task.state ? 'text-grey' : 'text-primary'">{{ task.name }}</span>
              </template>
            </v-list-item-title>

            <template v-slot:append>
              <v-expand-x-transition group>
                <v-icon
                  :key="1"
                  color="primary"
                  @click="task.editing ? saveTask(task) : editTask(task)"
                >
                  {{ task.editing ? 'mdi-content-save' : 'mdi-pencil' }}
                </v-icon>
                <v-icon 
                  :key="2"
                  color="error" 
                  @click="deleteTask(task.id)"
                >
                  mdi-delete
                </v-icon>
              </v-expand-x-transition>
            </template>
          </v-list-item>
        </template>
      </v-slide-y-transition>
    </v-card>
  </v-container>
</template>

<script>
const { getUserToken } = useAuth()

definePageMeta({
  middleware: ['auth'],
  layout: 'loggedin'
})
  
export default {
  data: () => ({
    tasks: [],
    newTask: null,
    errorMessage: '',
    editingErrorMessages: '',
  }),

  computed: {
    completedTasks () {
      return this.tasks.filter(task => task.state).length
    },
    progress () {
      return this.completedTasks / this.tasks.length * 100
    },
    remainingTasks () {
      return this.tasks.length - this.completedTasks
    },
  },

  mounted () {
    this.getTasks()
  },

  methods: {
    async createTask() {
      this.errorMessage = ''
      try {
        await useGqlToken(getUserToken)
        const result = await GqlCreateTask({name: this.newTask})
        this.tasks.push({
          state: false,
          name: this.newTask,
        })
        this.newTask = null
      } catch (error) {
        if (error.gqlErrors && error.gqlErrors.length > 0) {
          this.errorMessage = error.gqlErrors[0].extensions.debugMessage
        } else {
          this.errorMessage = 'An error occurred while creating the task.'
        }
      }
    },
    async getTasks() {
      try {
        await useGqlToken(getUserToken)
        const result = await GqlGetTasks()
        this.tasks = result.tasks
      } catch (error) {
        console.log(error)
      }
    },
    async toggleTaskState(task) {
      await this.updateTask(task)
    },
    async deleteTask(taskId) {
      try {
        await useGqlToken(getUserToken)
        await GqlDeleteTask({ id: taskId })
        this.tasks = this.tasks.filter(task => task.id !== taskId)
      } catch (error) {
        console.error('An error occurred while deleting the task:', error)
      }
    },
    async updateTask(task, editing = false) {
      try {
        await useGqlToken(getUserToken)
        await GqlUpdateTask({ id: task.id, name: task.name, state: task.state })
        if (editing) {
          task.editing = false
        }
      } catch (error) {
        if (error.gqlErrors && error.gqlErrors.length > 0) {
          this.editingErrorMessages = error.gqlErrors[0].extensions.debugMessage
        } else {
          this.editingErrorMessages = 'An error occurred while creating the task.'
        }
      }
    },
    editTask(task) {
      task.editName = task.name
      task.editing = true
    },
    async saveTask(task) {
      task.name = task.editName
      await this.updateTask(task, true)
    },
    async deleteCompletedTasks() {
      const completedTasks = this.tasks.filter(task => task.state)
      try {
        await useGqlToken(getUserToken)
        await Promise.all(completedTasks.map(task => GqlDeleteTask({ id: task.id })))
        this.tasks = this.tasks.filter(task => !task.state)
      } catch (error) {
        console.error('An error occurred while deleting completed tasks:', error)
      }
    },
    async deleteAllTasks() {
      try {
        await useGqlToken(getUserToken)
        await Promise.all(this.tasks.map(task => GqlDeleteTask({ id: task.id })))
        this.tasks = []
      } catch (error) {
        console.error('An error occurred while deleting completed tasks:', error)
      }
    },
  },
}
</script>
