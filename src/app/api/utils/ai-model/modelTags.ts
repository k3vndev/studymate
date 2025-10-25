const TAGS = {
  START: '<¤§<',
  END: '>§¤>'
}

export const MODEL_TAGS = ['TEXT', 'CODE', 'STUDYPLAN'] as const
export type ModelTag = (typeof MODEL_TAGS)[number]

const open = (name: ModelTag) => `${TAGS.START}${name}${TAGS.END}`
const close = (name: ModelTag) => open(`/${name}` as ModelTag)

const wrap = (name: ModelTag, txt: string) => `${open(name)}\n${txt}\n${close(name)}`

export const modelTags = { open, close, wrap }
