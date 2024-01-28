import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {CONSPECT_TYPES, SOURCE_TYPES, CRITERIONS} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import DataPagination from '../UI&UX/DataPagination'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import CloseIt from '../UI&UX/CloseIt'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType} from '../../types/types'

const Lecture: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [image, setImage] = useState<string>('')
    const [conspects, setConspects] = useState<any[]>([])
    const [sources, setSources] = useState<any[]>([])
    const [conspect, setConspect] = useState<any | null>(null)
    const [source, setSource] = useState<any | null>(null)
    const [lecture, setLecture] = useState<any | null>(null)
    const [state, setState] = useState({
        text: '',
        format: CONSPECT_TYPES[0],
        timestamp: 50,
        title: '',
        category: SOURCE_TYPES[0],
        url: '',
        criterion: CRITERIONS[0],
        rating: 50
    })

    const centum = new Centum()

    const {text, format, timestamp, title, category, url, criterion, rating} = state

    const getLectureM = gql`
        mutation getLecture($username: String!, $shortid: String!) {
            getLecture(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                title
                category
                university
                subject
                course
                criterion
                rating
                conspects {
                    shortid
                    name
                    text
                    format
                    timestamp
                    image
                    likes
                }
                sources {
                    shortid
                    name
                    title
                    category
                    url
                }
            }
        }
    `

    const updateLectureInfoM = gql`
        mutation updateLectureInfo($username: String!, $id: String!, $criterion: String!, $rating: Float!) {
            updateLectureInfo(username: $username, id: $id, criterion: $criterion, rating: $rating)
        }
    `

    const makeLectureSourceM = gql`
        mutation makeLectureSource($username: String!, $id: String!, $title: String!, $category: String!, $url: String!) {
            makeLectureSource(username: $username, id: $id, title: $title, category: $category, url: $url)
        }
    `

    const manageLectureConspectM = gql`
        mutation manageLectureConspect($username: String!, $id: String!, $option: String!, $text: String!, $format: String!, $timestamp: Float!, $image: String!, $coll_id: String!) {
            manageLectureConspect(username: $username, id: $id, option: $option, text: $text, format: $format, timestamp: $timestamp, image: $image, coll_id: $coll_id)
        }
    `

    const [manageLectureConspect] = useMutation(manageLectureConspectM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.manageLectureConspect)
            window.location.reload()
        }
    })

    const [makeLectureSource] = useMutation(makeLectureSourceM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.makeLectureSource)
            window.location.reload()
        }
    })

    const [updateLectureInfo] = useMutation(updateLectureInfoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateLectureInfo)
            window.location.reload()
        }
    })

    const [getLecture] = useMutation(getLectureM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getLecture)
            setLecture(data.getLecture)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getLecture({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (lecture !== null) {
            setState({...state, criterion: lecture.criterion, rating: lecture.rating})
        }
    }, [lecture])

    const onView = () => {
        window.open(source.url)
    }

    const onManageConspect = (option: string) => {
        manageLectureConspect({
            variables: {
                username: context.username, id: params.id, option, text, format, timestamp, image, coll_id: conspect === null ? '' : conspect.shortid
            }
        })
    }

    const onUpdateInfo = () => {
        updateLectureInfo({
            variables: {
                username: context.username, id: params.id, criterion, rating
            }
        })
    }

    const onMakeSource = () => {
        makeLectureSource({
            variables: {
                username: context.username, id: params.id, title, category, url
            }
        })
    }

    return (
        <>          
            {lecture !== null &&
                <>
                    <h2>{lecture.title}</h2>
                 
                    <h4 className='pale'>Дисциплина: {lecture.subject} ({lecture.course} курс)</h4>

                    <h2>Оценивание лектора</h2>
                    <select value={criterion} onChange={e => setState({...state, criterion: e.target.value})}>
                        {CRITERIONS.map(el => <option value={el}>{el}</option>)}
                    </select>
                    <h4 className='pale'>Рейтинг: <b>{rating}%</b></h4>
                    <input value={rating} onChange={e => setState({...state, rating: parseInt(e.target.value)})} type='range' step={1} />
                    <button onClick={onUpdateInfo} className='light-btn'>Обновить</button>

                    <h2>Создайте свой конспект</h2>
                    <textarea value={text} onChange={e => setState({...state, text: e.target.value})} placeholder='Опишите это...' />
                    <h4 className='pale'>Тип</h4>
                    <div className='items small'>
                        {CONSPECT_TYPES.map(el => <div onClick={() => setState({...state, format: el})} className={el === format ? 'item label active' : 'item label'}>{el}</div>)}
                    </div>
                    <h4 className='pale'>Место в семестре: {timestamp}%</h4>
                    <input value={timestamp} onChange={e => setState({...state, timestamp: parseInt(e.target.value)})} type='range' step={1} />
                    <ImageLoader setImage={setImage} />
                    <button onClick={() => onManageConspect('create')}>Загрузить</button>

                    <DataPagination initialItems={lecture.conspects} setItems={setConspects} label='Конспекты к лекции:' />

                    <div className='items half'>
                        {conspects.map(el =>
                            <div onClick={() => setConspect(el)} className='item card'>
                                {centum.shorter(el.text)}
                                <h5 className='pale'>{el.format}</h5>
                            </div>    
                        )}
                    </div>

                    {conspect !== null &&
                        <>
                            <CloseIt onClick={() => setConspect(null)} />

                            {conspect.image !== '' && <ImageLook src={conspect.image} className='photo_item' />}

                            <h2>{conspect.text}</h2>

                            <div className='items small'>
                                <h4 className='pale'>Тип: {conspect.format}</h4>
                                <h4 className='pale'>Место в семестре: {conspect.timestamp}%</h4>
                            </div>

                            {context.username === conspect.name ?
                                    <button onClick={() => onManageConspect('delete')}>Удалить</button>
                                :
                                    <button onClick={() => onManageConspect('like')}>Нравится</button>
                            }  
                        </>
                    }

                    <h2>Поделитесь ресурсом</h2>
                   
                    <div className='items small'>
                        <div className='item'>
                            <h4 className='pale'>Название</h4>
                            <input value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Заголовок ресурса' type='text' />  
                        </div>
                        <div className='item'>
                            <h4 className='pale'>Ссылка</h4>
                            <input value={url} onChange={e => setState({...state, url: e.target.value})} placeholder='URL' type='text' />  
                        </div>
                    </div>

                    <select value={category} onChange={e => setState({...state, category: e.target.value})}>
                        {SOURCE_TYPES.map(el => <option value={el}>{el}</option>)}
                    </select>

                    <button onClick={onMakeSource}>Опубликовать</button>

                    <DataPagination initialItems={lecture.sources} setItems={setSources} label='Список ресурсов:' />

                    <div className='items half'>
                        {sources.map(el => 
                            <div onClick={() => setSource(el)} className='item card'>
                                {centum.shorter(el.title)}
                                <h5 className='pale'>{el.category}</h5>
                            </div>    
                        )}
                    </div>

                    {source !== null &&
                        <>
                            <CloseIt onClick={() => setSource(null)} />

                            <h2>{source.title}</h2>
                            <h4 className='pale'>{source.category}</h4>

                            <button onClick={onView} className='light-btn'>View</button>
                        </>
                    }
                </>
            }

            {lecture === null && <Loading loadingLabel='лекции' />}
        </>
    )
}

export default Lecture