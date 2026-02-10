/**
 * This class is responsible for decoding the incoming chat stream.
 */
export class StreamChat {
  openTag = ''
  tagBuffer = ''

  readonly TAG_SLICE_LENGTH = 4
  readonly MAX_CHARS_NO_TAG = 5

  charsNoTagCount = 0

  readonly TAGS = Object.entries({
    studyplan: {
      open: '<¤§<STUDYPLAN>§¤>',
      close: '<¤§</STUDYPLAN>§¤>'
    },
    text: {
      open: '<¤§<TEXT>§¤>',
      close: '<¤§</TEXT>§¤>'
    }
  } as const)

  /**
   * Main logic to decode the incoming chat stream.
   * It validates the tags and only returns text that is meant to be written to the chat.
   */
  decodeNewChunk(chunk: string) {
    let validatedChunk = ''

    for (const char of chunk) {
      // Compare with tags
      let wroteToTagBuffer = false

      for (const [tagName, values] of this.TAGS) {
        // Main tag handling logic
        // Only handle tags if we detect were in the process of opening/closing a tag.
        if (
          (!this.openTag && char === values.open[this.tagBuffer.length]) ||
          (this.openTag && char === values.close[this.tagBuffer.length])
        ) {
          // Normally write to buffer
          this.tagBuffer += char
          wroteToTagBuffer = true

          // Tag opening/closing logic:

          if (values.open === this.tagBuffer) {
            // Tag was correctly opened.
            this.openTag = this.tagBuffer.slice(this.TAG_SLICE_LENGTH, -this.TAG_SLICE_LENGTH)
            this.tagBuffer = ''
            break
          }

          if (this.openTag && this.tagBuffer === values.close) {
            // Tag was incorrectly closed
            if (this.openTag !== tagName.toUpperCase()) {
              throw new Error('Undexpected close of the incorrect tag')
            }

            // Tag was closed
            this.openTag = ''
            this.tagBuffer = ''

            // Signal that a full message has been written to the chat and the next text chunks will belong to a new message.
            this.onFinishWritingText?.()
            break
          }
        }
      }

      // Detect if assistant is not using tags correctly
      // If we are recieving characters but there is no open tag and tag buffer is empty, it means that the assistant is writing text that is not meant to be written to the chat.

      if (!wroteToTagBuffer && !this.openTag && char.trim() !== '') {
        if (++this.charsNoTagCount > this.MAX_CHARS_NO_TAG) {
          this.onAssistantError?.(
            'Detected text that is not wrapped in tags. Please make sure to wrap all text in the correct tags.'
          )
          this.charsNoTagCount = 0
        }
      } else {
        this.charsNoTagCount = 0
      }

      if (!wroteToTagBuffer) {
        this.tagBuffer = ''

        // We can only write to the chat if we have a valid open tag, otherwise we would be writing text that is not meant to be written.
        if (this.openTag) {
          validatedChunk += char
        }
      }
    }

    if (this.openTag) {
      this.onWriteText?.(validatedChunk)
    }
  }

  /**
   * Callback that is called when the decoder has validated text that is meant to be written to the chat.
   */
  onWriteText: ((textChunk: string) => void) | null = null

  /**
   * Callback that is called when the decoder has finished writing a full message to the chat.
   * More messages can still be incoming, but this callback signals that a full message has been written and the next text chunks will belong to a new message.
   */
  onFinishWritingText: (() => void) | null = null

  /**
   * Callback that is called when the decoder detects that the assistant is not using the tags correctly and is writing text that is not meant to be written to the chat. Error message can be shown to the assistant to signal that it is making a mistake and should fix it.
   */
  onAssistantError: ((errorMessage: string) => void) | null = null
}
