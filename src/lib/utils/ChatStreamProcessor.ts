import { modelTags } from '@/app/api/utils/ai-model/modelTags'

export class ChatStreamProcessor {
  private mode: 'MARKDOWN' | 'STUDYPLAN' | 'TRANSITION' = 'MARKDOWN'
  private buffer = ''

  private readonly STUDYPLAN_OPEN = modelTags.open('STUDYPLAN')
  private readonly STUDYPLAN_CLOSE = modelTags.close('STUDYPLAN')

  /* 
    TRANSITION mode behavior:
    
    When the processor detects an OPEN or CLOSE tag, it switches to TRANSITION mode. In this mode, the processor will not stream any content until the next chunk is processed and the buffer is flushed. This way, the content before and after the tags will be flushed separately and the bug where content is sent again when the closing tag is found will be fixed.
  */

  processNewChunk(chunk: string) {
    for (const char of chunk) {
      this.buffer += char

      // --- MARKDOWN MODE ---
      if (this.mode === 'MARKDOWN') {
        if (this.buffer.endsWith(this.STUDYPLAN_OPEN)) {
          // Flush markdown before tag
          const flushed = this.buffer.slice(0, -this.STUDYPLAN_OPEN.length)
          if (flushed) {
            // NOTE: This generates a bug where the content is sent again when the STUDYPLAN_CLOSE tag is found, because the buffer is flushed again
            // This should be automatically fixed once the new mode TRANSITION is fully implemented
            this.onWriteMarkdown?.(flushed)
          }

          this.buffer = ''
          this.mode = 'STUDYPLAN'
          continue
        }

        // Stream markdown normally
        this.onWriteMarkdown?.(char)
        this.buffer = ''
      }

      // --- STUDYPLAN MODE ---
      else {
        if (this.buffer.endsWith(this.STUDYPLAN_CLOSE)) {
          // Flush studyplan before closing tag
          const flushed = this.buffer.slice(0, -this.STUDYPLAN_CLOSE.length)
          if (flushed) {
            this.onWriteStudyplan?.(flushed)
          }

          this.buffer = ''
          this.mode = 'MARKDOWN'
          this.onFinishWritingText?.()
          continue
        }

        // Stream raw studyplan content (no tags)
        this.onWriteStudyplan?.(char)
        this.buffer = ''
      }
    }
  }

  /**
   * Streams normal assistant text (markdown allowed)
   */
  onWriteMarkdown: ((textChunk: string) => void) | null = null

  /**
   * Streams STUDYPLAN content only (tags excluded)
   */
  onWriteStudyplan: ((textChunk: string) => void) | null = null

  /**
   * Called when a STUDYPLAN block fully ends
   */
  onFinishWritingText: (() => void) | null = null
}
