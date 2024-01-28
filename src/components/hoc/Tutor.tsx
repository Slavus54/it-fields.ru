import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {QUESTION_TYPES, TUTOR_SIDES, PERIONDS, QUOTE_TYPES} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import CloseIt from '../UI&UX/CloseIt'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType} from '../../types/types'

const Tutor: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [image, setImage] = useState<string>('')
    const [percent, setPercent] = useState<number>(50)
    const [quotes, setQuotes] = useState<any[]>([])
    const [reviews, setReviews] = useState<any[]>([])
    const [quote, setQuote] = useState<any | null>(null)
    const [review, setReview] = useState<any | null>(null)
    const [tutor, setTutor] = useState<any | null>(null)
    const [state, setState] = useState({
        text: '',
        category: QUESTION_TYPES[0],
        subject: '',
        criterion: TUTOR_SIDES[0],
        period: PERIONDS[0],
        rating: 50,
        grade: 4
    })

    const centum = new Centum()

    const {text, category, subject, criterion, period, rating, grade} = state

    const getTutorM = gql`
        mutation getTutor($username: String!, $shortid: String!) {
            getTutor(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                fullname
                category
                institution
                subjects
                region
                cords {
                    lat
                    long
                }
                url
                grade
                image
                quotes {
                    shortid
                    text
                    category
                    subject
                    likes
                }
                reviews {
                    shortid
                    name
                    criterion
                    period
                    rating
                }
            }
        }
    `
    
    const updateTutorInfoM = gql`
        mutation updateTutorInfo($username: String!, $id: String!, $grade: Float!, $image: String!) {
            updateTutorInfo(username: $username, id: $id, grade: $grade, image: $image)
        }
    `

    const makeTutorReviewM = gql`
        mutation makeTutorReview($username: String!, $id: String!, $criterion: String!, $period: String!, $rating: Float!) {
            makeTutorReview(username: $username, id: $id, criterion: $criterion, period: $period, rating: $rating)
        }
    `

    const manageTutorQuoteM = gql`
        mutation manageTutorQuote($username: String!, $id: String!, $option: String!, $text: String!, $category: String!, $subject: String!, $coll_id: String!) {
            manageTutorQuote(username: $username, id: $id, option: $option, text: $text, category: $category, subject: $subject, coll_id: $coll_id)
        }
    `

    const [manageTutorQuote] = useMutation(manageTutorQuoteM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageTutorQuote)
            window.location.reload()
        }
    })

    const [makeTutorReview] = useMutation(makeTutorReviewM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.makeTutorReview)
            window.location.reload()
        }
    })

    const [updateTutorInfo] = useMutation(updateTutorInfoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateTutorInfo)
            window.location.reload()
        }
    })

    const [getTutor] = useMutation(getTutorM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getTutor)
            setTutor(data.getTutor)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getTutor({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (tutor !== null) {
            setImage(tutor.image)
            setPercent(centum.percent(tutor.grade, 5))
        }
    }, [tutor])

    useMemo(() => {
        setState({...state, grade: centum.part(percent, 5, 1)})
    }, [percent])

    const onUpdateInfo = () => {
        updateTutorInfo({
            variables: {
                username: context.username, id: params.id, grade, image
            }
        })
    }

    const onManageQuote = (option: string) => {
        manageTutorQuote({
            variables: {
                username: context.username, id: params.id, option, text, category, subject, coll_id: quote === null ? '' : quote.shortid 
            }
        })
    }

    const onMakeReview = () => {
        makeTutorReview({
            variables: {
                username: context.username, id: params.id, criterion, period, rating
            }
        })
    }

    return (
        <>          
            {tutor !== null &&
                <>
                    <h1>{tutor.fullname}</h1>

                    {image !== '' && <ImageLook src={image} className='photo_item' alt='tutor photo' />}

                    <h3 className='pale'>Ваша успеваемость: {grade}</h3>
                    <input value={percent} onChange={e => setPercent(parseInt(e.target.value))} type='range' step={1} />

                    {context.username === tutor.username && <ImageLoader setImage={setImage} />}

                    <button onClick={onUpdateInfo} className='light-btn'>Обновить</button>

                    {review === null ? 
                            <>                                
                                <h3 className='pale'>Отзывы по критерию</h3>
                                <div className='items small'>
                                    {TUTOR_SIDES.map(el => <div onClick={() => setState({...state, criterion: el})} className={el === criterion ? 'item label active' : 'item label'}>{el}</div>)}
                                </div>

                                <select value={period} onChange={e => setState({...state, period: e.target.value})}>
                                    {PERIONDS.map(el => <option value={el}>{el}</option>)}
                                </select>

                                <h3 className='pale'>Рейтинг: {rating}%</h3>
                                <input value={rating} onChange={e => setState({...state, rating: parseInt(e.target.value)})} type='range' step={1} />

                                <button onClick={onMakeReview}>Добавить</button>

                                <DataPagination initialItems={tutor.reviews} setItems={setReviews} label='Отзывы:' />
                                
                                <div className='items half'>
                                    {reviews.map(el => 
                                        <div onClick={() => setReview(el)} className='item card'>
                                            {el.criterion} от {el.name}
                                        </div>    
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setReview(null)} />

                                <h2>{review.criterion}</h2>

                                <div className='items small'>
                                    <h4 className='pale'>Период: {review.period}</h4>
                                    <h4 className='pale'>Оценка: {review.rating}%</h4>
                                </div>
                            </>
                    }

                    {quote === null ? 
                            <>
                                <h2>Новое высказывание</h2>
                                <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Цитата преподавателя' />
                                <h4 className='pale'>Дисциплина</h4>
                                <div className='items half'>
                                    {tutor.subjects.map((el: string) => <div onClick={() => setState({...state, subject: el})} className='item panel'>{el}</div>)}
                                </div>
                                <h4 className='pale'>Тема</h4>
                                <select value={category} onChange={e => setState({...state, category: e.target.value})}>
                                    {QUOTE_TYPES.map(el => <option value={el}>{el}</option>)}
                                </select>
                                <button onClick={() => onManageQuote('create')}>Опубликовать</button>

                                <DataPagination initialItems={tutor.quotes} setItems={setQuotes} label='Список высказываний:' />
                                
                                <div className='items half'>
                                    {quotes.map(el => 
                                        <div onClick={() => setQuote(el)} className='item card'>
                                            {centum.shorter(el.text)}
                                            <h5 className='pale'>{el.subject}</h5>
                                        </div>    
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setQuote(null)} />

                                <h2>{quote.text}</h2>

                                <div className='items small'>
                                    <h4 className='pale'>Тип: {quote.category}</h4>
                                    <h4 className='pale'><b>{quote.likes}</b> лайков</h4>
                                </div>

                                {context.username === quote.name ? 
                                        <button onClick={() => onManageQuote('delete')}>Удалить</button>
                                    :
                                        <button onClick={() => onManageQuote('like')}>Нравится</button>
                                }
                            </>
                    }
                </> 
            }

            {tutor === null && <Loading loadingLabel='наставника' />}
        </>
    )
}

export default Tutor