import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {ROLES, TASK_TYPES, LEVELS, TASK_STATUSES, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
//@ts-ignore
import shortid from 'shortid'
//@ts-ignore
import {Datus, weekdays_titles} from 'datus.js'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import MapPicker from '../UI&UX/MapPicker'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import QuantityLabel from '../UI&UX/QuantityLabel'
import CloseIt from '../UI&UX/CloseIt'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'
import {CollectionPropsType} from '../../types/types'

const Practice: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [image, setImage] = useState<string>('')
    const [date_idx, setDateIdx] = useState<number>(0)

    const [tasks, setTasks] = useState<any[]>([])
    const [task, setTask] = useState<any | null>(null)

    const [members, setMembers] = useState<any[]>([])
    const [member, setMember] = useState<any | null>(null)

    const [practice, setPractice] = useState<any | null>(null)
    const [personality, setPersonality] = useState<any | null>(null)

    const datus = new Datus()

    const [state, setState] = useState({
        invite_code: '',
        weekday: weekdays_titles[0],
        role: ROLES[0],
        character: '',
        text: '',
        category: TASK_TYPES[0],
        level: LEVELS[0],
        deadline: datus.move(),
        status: TASK_STATUSES[0]
    })

    const centum = new Centum()

    const {invite_code, weekday, role, character, text, category, level, deadline, status} = state

    const getPracticeM = gql`
        mutation getPractice($username: String!, $shortid: String!) {
            getPractice(username: $username, shortid: $shortid) {
                shortid
                account_id
                username
                title
                category
                university
                faculty
                semester
                invite_code
                weekday
                region
                cords {
                    lat
                    long
                }
                members {
                    account_id
                    username
                    role
                    character
                }
                tasks {
                    shortid
                    name
                    text
                    category
                    level
                    deadline
                    status
                    image
                    likes
                }
            }
        }
    `

    const updatePracticeInfoM = gql`
        mutation updatePracticeInfo($username: String!, $id: String!, $invite_code: String!, $weekday: String!) {
            updatePracticeInfo(username: $username, id: $id, invite_code: $invite_code, weekday: $weekday) 
        }
    `

    const managePracticeStatusM = gql`
        mutation managePracticeStatus($username: String!, $id: String!, $option: String!, $role: String!, $invite_code: String!, $coll_id: String!, $character: String!) {
            managePracticeStatus(username: $username, id: $id, option: $option, role: $role, invite_code: $invite_code, coll_id: $coll_id, character: $character) 
        }
    `

    const managePracticeTaskM = gql`
        mutation managePracticeTask($username: String!, $id: String!, $option: String!, $text: String!, $category: String!, $level: String!, $deadline: String!, $status: String!, $image: String!, $coll_id: String!) {
            managePracticeTask(username: $username, id: $id, option: $option, text: $text, category: $category, level: $level, deadline: $deadline, status: $status, image: $image, coll_id: $coll_id) 
        }
    `

    const [managePracticeTask] = useMutation(managePracticeTaskM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.managePracticeTask)
            window.location.reload()
        }
    })

    const [managePracticeStatus] = useMutation(managePracticeStatusM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.managePracticeStatus)
            window.location.reload()
        }
    })

    const [updatePracticeInfo] = useMutation(updatePracticeInfoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updatePracticeInfo)
            window.location.reload()
        }
    })

    const [getPractice] = useMutation(getPracticeM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getPractice)
            setPractice(data.getPractice)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getPractice({
                variables: {
                    username: context.username, shortid: params.id
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (practice !== null) {
            let result = practice.members.find((el: any) => centum.search(el.account_id, context.account_id, 100))

            if (result !== undefined) {
                setPersonality(result)
            }

            setView({...view, latitude: practice.cords.lat, longitude: practice.cords.long, zoom: 17})
        }
    }, [practice])

    useMemo(() => {
        if (practice !== null && personality !== null) {
            setState({...state, invite_code: practice.invite_code, weekday: practice.weekday, role: personality.role})
        }
    }, [personality])

    useMemo(() => {
        if (member !== null) {
            setState({...state, character: member.character})
        }
    }, [member])

    useMemo(() => {
        if (task !== null) {
            setState({...state, status: task.status})
        }

        setImage(task === null ? '' : task.image)
    }, [task])

    useMemo(() => {
        setState({...state, deadline: datus.move('day', '+', date_idx)})
    }, [date_idx])

    const onGenInvite = () => {
        setState({...state, invite_code: shortid.generate().toString()})
    }

    const onManageStatus = (option: string) => {
        managePracticeStatus({
            variables: {
                username: context.username, id: params.id, option, role, invite_code, coll_id: member === null ? context.account_id : member.account_id, character
            }
        })
    }

    const onUpdateInfo = () => {
        updatePracticeInfo({
            variables: {
                username: context.username, id: params.id, invite_code, weekday 
            }
        })
    }

    const onManageTask = (option: string) => {
        managePracticeTask({
            variables: {
                username: context.username, id: params.id, option, text, category, level, deadline, status, image, coll_id: task === null ? '' : task.shortid
            }
        })
    }

    return (
        <>     

            {practice !== null && personality === null &&
                <>
                    <h2>Добро пожаловать, {context.username}!</h2>
                    <select value={role} onChange={e => setState({...state, role: e.target.value})}>
                        {ROLES.map(el => <option value={el}>{el}</option>)}
                    </select>
                    <h3 className='pale'>Введите инвайт-код</h3>
                    <input value={invite_code} onChange={e => setState({...state, invite_code: e.target.value})} placeholder='Код практики' type='text' />
                    <button onClick={() => onManageStatus('join')}>Присоединиться</button>
                </>
            }     

            {practice !== null && personality !== null &&
                <>
                    <h2>{practice.title}</h2>

                    <div className='items small'>
                        <h4 className='pale'>Тип: {practice.category}</h4>
                        <h4 className='pale'>Факультет: {practice.faculty}</h4>
                    </div>

                    <h2>Персональная информация</h2>
                    <select value={role} onChange={e => setState({...state, role: e.target.value})}>
                        {ROLES.map(el => <option value={el}>{el}</option>)}
                    </select>
                    <p>Характеристика: {personality.character}</p>
                    <button onClick={() => onManageStatus('update')}>Обновить</button>

                    <h2>Организация встреч и рекрутинг</h2>
                    <div className='items small'>
                        {weekdays_titles.map((el: string) => <div onClick={() => setState({...state, weekday: el})} className={el === weekday ? 'item label active' : 'item label'}>{el}</div>)}
                    </div>
                    <p onClick={onGenInvite}>{invite_code}</p>
                    <button onClick={onUpdateInfo}>Обновить</button>

                    <h2>Где будут встречи?</h2>
                    <ReactMapGL {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                        <Marker latitude={practice.cords.lat} longitude={practice.cords.long}>
                            <MapPicker type='picker' />
                        </Marker>
                    </ReactMapGL>

                    {task === null ? 
                            <>
                                <h2>Новая задача</h2>
                                <textarea value={text} onChange={e =>  setState({...state, text: e.target.value})} placeholder='Опишите это...' />
                                <h4 className='pale'>Тип</h4>
                                <div className='items small'>
                                    {TASK_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                                </div>
                                <h4 className='pale'>Уровень сложности</h4>
                                <select value={level} onChange={e => setState({...state, level: e.target.value})}>
                                    {LEVELS.map(el => <option value={el}>{el}</option>)}
                                </select>
                                <QuantityLabel num={date_idx} setNum={setDateIdx} min={0} max={10} part={1} label={`Дедлайн: ${deadline}`} />
                                <ImageLoader setImage={setImage} />

                                <button onClick={() => onManageTask('create')}>Опубликовать</button>
                                <DataPagination initialItems={practice.tasks} setItems={setTasks} label='Наши задачи:' />
                                <div className='items half'>
                                    {tasks.map(el => 
                                        <div onClick={() => setTask(el)} className='item card'>
                                            {centum.shorter(el.text)}
                                        </div>    
                                    )}
                                </div>
                            </>
                        :
                            <>
                                <CloseIt onClick={() => setTask(null)} />
                                <ImageLook src={image} className='photo_item' />
                                <h2>{task.text}</h2>

                                <div className='items small'>
                                    <h4 className='pale'>Сложность: {task.level}</h4>
                                    <h4 className='pale'>Дедлайн: {task.deadline}</h4>
                                </div>

                                {context.username === task.name ? 
                                        <>
                                            <h4 className='pale'>Статус</h4>
                                            <select value={status} onChange={e => setState({...state, status: e.target.value})}>
                                                {TASK_STATUSES.map(el => <option value={el}>{el}</option>)}
                                            </select>
                                            <ImageLoader setImage={setImage} />

                                            <div className='items small'>
                                                <button onClick={() => onManageTask('delete')}>Удалить</button>
                                                <button onClick={() => onManageTask('update')}>Обновить</button>
                                            </div>
                                        </>
                                    :
                                        <button onClick={() => onManageTask('like')}>Нравится</button>
                                }
                            </>
                    }

                    <DataPagination initialItems={practice.members} setItems={setMembers} label='Список участников:' />
                    <div className='items half'>
                        {members.map(el => 
                            <div onClick={() => setMember(el)} className='item card'>
                                {el.username}
                                <h5 className='pale'>{el.role}</h5>
                            </div>    
                        )}
                    </div>

                    {member !== null &&
                        <>
                            <CloseIt onClick={() => setMember(null)} />
                          
                            <h2>{member.username}</h2>
                            <h4 className='pale'>{member.role}</h4>

                            <NavigatorWrapper id={member.account_id} isRedirect={true}>
                                <button className='light-btn'>Подробнее</button>
                            </NavigatorWrapper>

                            <textarea value={character} onChange={e =>  setState({...state, character: e.target.value})} placeholder='Опишите участника' />
                            <button onClick={() => onManageStatus('estimate')}>Оценить</button>
                        </>
                    }

                    <h3 className='pale'>Закончили проект или устали?</h3>
                    <button onClick={() => onManageStatus('exit')} className='light-btn'>Выйти</button>  
                </>
            }

            {practice === null && <Loading loadingLabel='практики' />}
        </>
    )
}

export default Practice