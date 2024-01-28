import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {QUESTION_TYPES, LEVELS, PHOTO_TYPES} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import {Datus} from 'datus.js'
import {Context} from '../../context/WebProvider'
import CloseIt from '../UI&UX/CloseIt'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType} from '../../types/types'

const Vacancy: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [image, setImage] = useState<string>('')
    const [photos, setPhotos] = useState<any[]>([])
    const [photo, setPhoto] = useState<any | null>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [question, setQuestion] = useState<any | null>(null)
    const [vacancy, setVacancy] = useState<any | null>(null)
    const [state, setState] = useState({
        text: '',
        category: QUESTION_TYPES[0],
        level: LEVELS[0],
        answer: '',
        title: '',
        format: PHOTO_TYPES[0]
    })

    const centum = new Centum()
    const datus = new Datus()

    const {text, category, level, answer, title, format} = state

    const getVacancyM = gql`
        mutation getVacancy($username: String!, $shortid: String!) {
            getVacancy(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                title
                category
                position
                region
                cords {
                    lat
                    long
                }
                experience
                url
                questions {
                    shortid
                    name
                    text
                    category
                    level
                    answer
                    accepted
                }
                photos {
                    shortid
                    title
                    format
                    image
                    dateUp
                    likes
                }
            }
        }
    `

    const manageVacancyQuestionM = gql`
        mutation manageVacancyQuestion($username: String!, $id: String!, $option: String!, $text: String!, $category: String!, $level: String!, $coll_id: String!, $answer: String!) {
            manageVacancyQuestion(username: $username, id: $id, option: $option, text: $text, category: $category, level: $level, coll_id: $coll_id, answer: $answer)
        }
    `

    const manageVacancyPhotoM = gql`
        mutation manageVacancyPhoto($username: String!, $id: String!, $option: String!, $title: String!, $format: String!, $image: String!, $dateUp: String!, $coll_id: String!) {
            manageVacancyPhoto(username: $username, id: $id, option: $option, title: $title, format: $format, image: $image, dateUp: $dateUp, coll_id: $coll_id) 
        }
    `

    const [manageVacancyPhoto] = useMutation(manageVacancyPhotoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageVacancyPhoto)
            window.location.reload()
        }
    })

    const [manageVacancyQuestion] = useMutation(manageVacancyQuestionM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageVacancyQuestion)
            window.location.reload()
        }
    })

    const [getVacancy] = useMutation(getVacancyM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getVacancy)
            setVacancy(data.getVacancy)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getVacancy({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (question !== null) {
            setState({...state, answer: ''})
        }
    }, [question])

    const onManageQuestion = (option: string) => {
        manageVacancyQuestion({
            variables: {
                username: context.username, id: params.id, option, text, category, level, coll_id: question === null ? '' : question.shortid, answer
            }
        })
    }

    const onManagePhoto = (option: string) => {
        manageVacancyPhoto({
            variables: {
                username: context.username, id: params.id, option, title, format, image, dateUp: datus.move(), coll_id: photo === null ? '' : photo.shortid
            }
        })
    }

    return (
        <>          
            {vacancy !== null &&
                <>
                    <h2>{vacancy.title}</h2>

                    <div className='items small'>
                        <h4 className='pale'>Должность: {vacancy.position}</h4>
                        <h4 className='pale'>Опыт: {vacancy.experience} лет</h4>
                    </div>

                    {context.username === vacancy.username ? 
                            <>
                                <h2>Новое фото</h2>
                                <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Название' type='text' />
                                <h4 className='pale'>Тип</h4>
                                <select value={format} onChange={e => setState({...state, format: e.target.value})}>
                                    {PHOTO_TYPES.map(el => <option value={el}>{el}</option>)}
                                </select>
                                <ImageLoader setImage={setImage} />

                                <button onClick={() => onManagePhoto('create')}>Опубликовать</button>
                            </>
                        :
                            <>
                                <h2>Новый вопрос</h2>
                                <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Ваша формулировка...' />
                                <h4 className='pale'>Тип</h4>
                                <div className='items small'>
                                    {QUESTION_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                                </div>
                                <h4 className='pale'>Сложность</h4>
                                <select value={level} onChange={e => setState({...state, level: e.target.value})}>
                                    {LEVELS.map(el => <option value={el}>{el}</option>)}
                                </select>
                                
                                <button onClick={() => onManageQuestion('create')}>Задать</button>
                            </>
                    }

                    <DataPagination initialItems={vacancy.questions} setItems={setQuestions} label='Список вопросов:' />
                    <div className='items half'>
                        {questions.map(el => 
                            <div onClick={() => setQuestion(el)} className='item card'>
                                {centum.shorter(el.text)}
                            </div>    
                        )}
                    </div>

                    {question !== null &&
                        <>
                            <CloseIt onClick={() => setQuestion(null)} />

                            <h2>{question.text}</h2>

                            <div className='items small'>
                                <h4 className='pale'>Тип: {question.category}</h4>
                                <h4 className='pale'>Сложность: {question.level}</h4>
                            </div>

                            {context.username === question.name && <button onClick={() => onManageQuestion('delete')}>Удалить</button>}

                            {context.username === vacancy.username && !question.accepted &&
                                <>
                                    <h2>Ответьте на вопрос</h2>
                                    <textarea value={answer} onChange={e => setState({...state, answer: e.target.value})} placeholder='Ваша формулировка...' />
                                    <button onClick={() => onManageQuestion('answer')}>Ответить</button>
                                </>
                            }
                        </>
                    }

                    <DataPagination initialItems={vacancy.photos} setItems={setPhotos} label='Галерея:' />
                    <div className='items half'>
                        {photos.map(el => 
                            <div onClick={() => setPhoto(el)} className='item card'>
                                {centum.shorter(el.title)}
                            </div>    
                        )}
                    </div>

                    {photo !== null &&
                        <>
                            <CloseIt onClick={() => setPhoto(null)} />

                            {photo.image !== '' && <ImageLook src={photo.image} className='photo_item' alt='photo' />}
                            
                            <h2>{photo.title}</h2>

                            <div className='items small'>
                                <h4 className='pale'>Тип: {photo.format}</h4>
                                <h4 className='pale'><b>{photo.likes}</b> лайков</h4>
                            </div>
                           
                            {context.username === vacancy.username ? 
                                    <button onClick={() => onManagePhoto('delete')}>Удалить</button>
                                :
                                    <button onClick={() => onManagePhoto('like')}>Нравится</button>
                            }
                        </>
                    }
                </>
            }

            {vacancy === null && <Loading loadingLabel='вакансии' />}
        </>
    )
}

export default Vacancy