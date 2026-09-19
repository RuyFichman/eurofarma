import type { AdminContentFormRecord } from '../../db/queries/educational-contents'
import type { AdminContentFormInput } from './content-form-schema'

export function mapContentToFormValues(
  content: AdminContentFormRecord,
): AdminContentFormInput {
  return {
    title: content.title,
    category: content.category ?? '',
    bodyMarkdown: content.bodyMarkdown,
    status: content.isPublished ? 'PUBLISHED' : 'DRAFT',
  }
}
