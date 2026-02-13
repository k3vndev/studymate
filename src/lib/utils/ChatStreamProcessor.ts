import { modelTags } from '@/app/api/utils/ai-model/modelTags'

/**
 * Processes a stream of text coming from the AI model, separating markdown content from Studyplan content using custom tags.
 * In order for this to work, `processNewChunk` must be called for every new chunk of text received from the stream, and the corresponding callbacks must be set to handle markdown and Studyplan content separately.
 * This does not interact with the stream directly, it only processes the text chunks given to it.
 */
export class ChatStreamProcessor {
  private mode: 'MARKDOWN' | 'STUDYPLAN' = 'MARKDOWN'
  private buffer = ''

  private readonly STUDYPLAN_OPEN = modelTags.open('STUDYPLAN')
  private readonly STUDYPLAN_CLOSE = modelTags.close('STUDYPLAN')

  processNewChunk(chunk: string) {
    for (const char of chunk) {
      const bufferNextIndex = this.buffer.length
      let textToWrite = char

      let openingStudyplanTag = false
      let closingStudyplanTag = false

      const isInPotentialTag = [
        this.STUDYPLAN_OPEN[bufferNextIndex],
        this.STUDYPLAN_CLOSE[bufferNextIndex]
      ].includes(char)

      if (isInPotentialTag) {
        // Write to buffer
        this.buffer += char

        openingStudyplanTag = this.buffer === this.STUDYPLAN_OPEN
        closingStudyplanTag = this.buffer === this.STUDYPLAN_CLOSE

        // Continue to next cycle early if the buffer is still a potential tag,
        if (!openingStudyplanTag && !closingStudyplanTag) continue

        // Clear buffer if it has matched an open or close tag, the tag will be adressed in the following code
        this.buffer = ''
      }

      // Flush buffer if is not a potential tag anymore
      else if (this.buffer) {
        textToWrite = this.buffer
        this.buffer = ''
      }

      // --- MARKDOWN MODE ---
      if (this.mode === 'MARKDOWN') {
        if (openingStudyplanTag) {
          this.onStartWritingStudyplan?.()
          this.mode = 'STUDYPLAN'
          openingStudyplanTag = false
          continue
        }

        if (closingStudyplanTag) {
          // This shouldn't happen. It means we're trying to close a never opened Studyplan
          if (process.env.NODE_ENV === 'development') {
            console.warn('Closing tag found while not in STUDYPLAN mode')
          }
          closingStudyplanTag = false
        }

        // Stream markdown normally
        this.onWriteMarkdown?.(textToWrite)
      }

      // --- STUDYPLAN MODE ---
      else if (this.mode === 'STUDYPLAN') {
        if (closingStudyplanTag) {
          this.onFinishWritingStudyplan?.()
          this.mode = 'MARKDOWN'
          closingStudyplanTag = false
          continue
        }

        if (openingStudyplanTag) {
          // This shouldn't happen. It means we're trying to open a new Studyplan while already in STUDYPLAN mode
          if (process.env.NODE_ENV === 'development') {
            console.warn('Opening tag found while already in STUDYPLAN mode')
          }
          openingStudyplanTag = false
        }

        // Stream raw studyplan content
        this.onWriteStudyplan?.(textToWrite)
      }
    }
  }

  /**
   * Called for every new chunk of text in MARKDOWN mode. Excludes all tags in normal behavior.
   */
  onWriteMarkdown: ((textChunk: string) => void) | null = null

  /**
   * Called when the stream starts writing a Studyplan
   */
  onStartWritingStudyplan: (() => void) | null = null

  /**
   * Called for every new chunk of text in STUDYPLAN mode. Excludes all tags in normal behavior.
   */
  onWriteStudyplan: ((textChunk: string) => void) | null = null

  /**
   * Called when the stream finishes writing a studyplan and stream ends or transitions to MARKDOWN.
   */
  onFinishWritingStudyplan: (() => void) | null = null
}
