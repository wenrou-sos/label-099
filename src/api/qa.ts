import { get, post } from './http'
import type { Expert, Question, Answer, ListResponse, PaginationParams, CreateQuestionParams, CreateAnswerParams } from '../../shared/types'

export function getExpertList(params: PaginationParams & { specialty?: string; keyword?: string }): Promise<ListResponse<Expert>> {
  return get('/experts', params)
}

export function getQuestionList(
  params: PaginationParams & { category?: string; keyword?: string; userId?: number; expertId?: number; isAnswered?: boolean }
): Promise<ListResponse<Question>> {
  return get('/questions', params)
}

export function getQuestion(id: number): Promise<Question & { answers: Answer[] }> {
  return get(`/questions/${id}`)
}

export function createQuestion(data: CreateQuestionParams): Promise<Question> {
  return post('/questions', data)
}

export function createAnswer(data: CreateAnswerParams): Promise<Answer> {
  return post('/answers', data)
}

export function watchQuestion(id: number): Promise<void> {
  return post(`/questions/${id}/watch`)
}
