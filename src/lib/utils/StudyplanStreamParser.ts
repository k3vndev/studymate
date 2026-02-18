import type { BaseStudyplan, GeneratingStudyplanContent } from '@types'

/**
 * Class responsible for understanding a Studyplan stream and parsing it into a `StudyplanUnsaved` object or show its generating content on the go.
 */
export class StudyplanStreamParser {
  private studyplanContent: GeneratingStudyplanContent = {}
  private lineBuffer = ''

  private baseStructure = ['name', 'desc', 'category']

  private isOnDailyLessonsPhase = false
  private currentDailyLessonNumber = -1
  private dailyLessons: DailyLesson[] = []

  /**
   * Processes a new chunk of Studyplan text content. This method should be called sequentially for each new chunk of text received from a stream.
   * @param chunk A new chunk of Studyplan text content to process.
   */
  processNewChunk(chunk: string) {
    for (const char of chunk) {
      if (char === '\n') {
        // Add line to saved lines
        this.processFullLine(this.lineBuffer)

        // Clear line buffer for next line and continue to next character
        this.lineBuffer = ''
        continue
      }

      // If we're still building a line, add the new character to the line buffer
      this.updateLineBuffer(char)
    }
  }

  // --- Called while the lines are being written ---
  private updateLineBuffer(txt: string) {
    // Add new character to line buffer
    this.lineBuffer += txt
    const { lineBuffer: buffer } = this

    if (this.isOnDailyLessonsPhase) {
      // -- We're in the daily lessons list population phase, there's nothing else to do here --
      return
    }

    // -- We have not yet reached to daily lesson list, so we're still in the base fields population phase --

    for (const structureKey of this.baseStructure) {
      // Handle base fields population
      const searchPattern = `${structureKey}: `

      if (buffer.startsWith(searchPattern)) {
        const content = buffer.slice(searchPattern.length)
        const prevContent: string = (this.studyplanContent as any)[structureKey]

        if (prevContent && prevContent.length > content.length) {
          this.onStudyplanError?.(
            `New content was shorter than previous content at basic key "${structureKey}". This most likely means the same key was setted in multiple lines`
          )
        }
        ;(this.studyplanContent as any)[structureKey] = content

        this.onStudyplanContentUpdate?.(this.studyplanContent)
        break
      }
    }
  }

  // --- Called when a full line has been written ---
  private processFullLine(fullLine: string) {
    const line = fullLine.trim()
    if (!line) return

    // Search for daily lesson list start pattern
    if (line === 'daily_lessons:') {
      // Detect invalid studyplan and an throw an error in that case
      const { name, desc, category } = this.studyplanContent
      if (!name || !desc || !category) this.onStudyplanError?.("Studyplan wasn't properly initialized")

      this.isOnDailyLessonsPhase = true
      return
    }

    if (!this.isOnDailyLessonsPhase) {
      // -- We have not yet reached to daily lesson list, so we're still in the base fields population phase --
      return
    }

    // Search for pattern '### number' to identify the start of a new daily lesson
    const dailyLessonSearchResult = line.match(/^### (\d+)$/)
    if (dailyLessonSearchResult) {
      // Always increase the daily lesson number to avoid issues with wrong numbering in the text.
      this.currentDailyLessonNumber++

      this.studyplanContent.lessons_count = this.currentDailyLessonNumber + 1 // +1 because the number is 0 indexed
      this.onStudyplanContentUpdate?.(this.studyplanContent)
      this.dailyLessons.push({ tasks: [] })
      return
    }

    // Search for pattern '- Task description' to identify the start of a new task for the current daily lesson
    const taskSearchResult = line.match(/^- (.+)$/)
    if (taskSearchResult) {
      const [, taskDescription] = taskSearchResult
      // Store task description to the current daily lesson
      this.dailyLessons[this.currentDailyLessonNumber].tasks.push(taskDescription)
      return
    }

    // Search for daily lesson name and description pattern 'name: lesson name' and 'desc: lesson description'
    const keys = ['name', 'desc'] as const
    for (const key of keys) {
      const searchPattern = `${key}: `
      if (line.startsWith(searchPattern)) {
        // Store daily lesson value
        const content = line.slice(searchPattern.length)
        ;(this.dailyLessons[this.currentDailyLessonNumber] as any)[key] = content

        // Set current generating lesson
        if (key === 'name') {
          this.studyplanContent.current_lesson = content
          this.onStudyplanContentUpdate?.(this.studyplanContent)
        }
        break
      }
    }
  }

  /**
   * This method is called every time the Studyplan content is updated with new information.
   * The Studyplan content here is limited to the base fields (name, desc, category)
   */
  onStudyplanContentUpdate: ((content: GeneratingStudyplanContent) => void) | null = null

  /**
   * This method is called whenever a format error is detected with the generating studyplan.
   * Detecting an error does not block the main internal logic.
   */
  onStudyplanError: ((errorMessage: string) => void) | null = null

  /**
   * Call this method when the Studyplan generation process is finished and you want to get the full generated Studyplan.
   * @returns The full generated Studyplan with all its fields, including the daily lessons list, or null if it couldn't be generated yet.
   */
  getFullStudyplan(): BaseStudyplan | null {
    const { studyplanContent, dailyLessons } = this
    if (!studyplanContent.name || !studyplanContent.desc || !studyplanContent.category) {
      // We don't have all the base fields yet, we can't generate the full studyplan
      return null
    }

    // Parse daily lessons
    const parsedDailyLessons: BaseStudyplan['daily_lessons'] = []

    for (let i = 0; i < dailyLessons.length; i++) {
      const { name, desc, tasks } = dailyLessons[i]

      if (!name || !desc || !tasks.length) {
        this.onStudyplanError?.(
          `Lesson for day ${i + 1} is missing some information. Current info: ${JSON.stringify(dailyLessons[i])}`
        )
        return null
      }
      parsedDailyLessons.push({ name, desc, tasks })
    }

    const fullStudyplan: BaseStudyplan = {
      ...(studyplanContent as any),
      daily_lessons: parsedDailyLessons
    }

    return fullStudyplan
  }
}

interface DailyLesson {
  name?: string
  desc?: string
  tasks: string[]
}
