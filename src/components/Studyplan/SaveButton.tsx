import { CONTENT_JSON } from '@/consts'
import { useUserBehavior } from '@/hooks/useUserBehavior'
import { StudyplanContext } from '@/lib/context/StudyplanContext'
import { dataFetch } from '@/lib/utils/dataFetch'
import { saveChatToDatabase } from '@/lib/utils/saveChatToDatabase'
import { useChatStore } from '@/store/useChatStore'
import { useStudyplansStore } from '@/store/useStudyplansStore'
import { useUserStore } from '@/store/useUserStore'
import { useRouter } from 'next/navigation'
import { useContext, useState } from 'react'
import { BookmarkIcon, LoadingIcon } from '../icons'

export const SaveButton = () => {
  const { studyplan, isSaved: studyplanIsSaved, publicId } = useContext(StudyplanContext)
  const [isLoading, setIsLoading] = useState(false)
  const modifyStudyplansList = useUserStore(s => s.modifyStudyplansList)
  const setChatStudyplanOriginalId = useChatStore(s => s.setStudyplanOriginalId)
  const setStateStudyplan = useStudyplansStore(s => s.setStudyplan)
  const router = useRouter()
  const onUser = useUserBehavior()

  const handleSave = (isSaving: boolean) => {
    if (!publicId && isSaving) {
      // The absence of a publicId means the studyplan is not in the database yet,
      // so we have to create it before saving it
      createAndSaveStudyplan()
      return
    }

    // If there's a publicId, we can save or unsave the studyplan
    saveOrUnsaveStudyplan(isSaving)
  }

  const createAndSaveStudyplan = async () => {
    setIsLoading(true)
    dataFetch<string>({
      url: '/api/user/lists/save',
      options: {
        method: 'POST',
        headers: CONTENT_JSON,
        body: JSON.stringify(studyplan)
      },
      onSuccess: savedId => {
        modifyStudyplansList(savedId, 'saved').add(true)

        if ('chat_message_id' in studyplan && studyplan.chat_message_id) {
          setChatStudyplanOriginalId(studyplan.chat_message_id, savedId, newMessages => {
            // Save chat messages to database
            saveChatToDatabase(newMessages)

            // Load new published studyplan
            setStateStudyplan({ ...studyplan, id: savedId })
            onUser({ stayed: () => router.replace(`/studyplan/${savedId}`) })
          })
        }
      },
      onFinish: () => setIsLoading(false),
      redirectOn401: true
    })
  }

  const saveOrUnsaveStudyplan = (isSaving: boolean) => {
    if (!publicId) return

    setIsLoading(true)
    dataFetch({
      url: '/api/user/lists/save',
      options: {
        method: 'PATCH',
        headers: CONTENT_JSON,
        body: JSON.stringify({
          id: publicId,
          save: isSaving
        })
      },
      onSuccess: () => {
        if (isSaving) {
          modifyStudyplansList(publicId, 'saved').add(true)
          return
        }
        modifyStudyplansList(publicId, 'saved').remove()
      },
      onFinish: () => setIsLoading(false),
      redirectOn401: true
    })
  }

  const fill = studyplanIsSaved ? 'fill-blue-20' : 'fill-none'
  const basicStyle = 'size-9 min-w-9 text-blue-20'

  return (
    <button
      onClick={() => handleSave(!studyplanIsSaved)}
      className='button flex items-center justify-center'
      disabled={isLoading}
    >
      {isLoading ? (
        <LoadingIcon className={`${basicStyle} animate-spin stroke-2`} />
      ) : (
        <BookmarkIcon className={`${fill} ${basicStyle} stroke-[1.5px]`} />
      )}
    </button>
  )
}
