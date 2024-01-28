import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import universities from '../../env/universities.json'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import MapPicker from '../UI&UX/MapPicker'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'
import {TownType, Cords} from '../../types/types'

const Practices: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [filtered, setFiltered] = useState<any[]>([])
    const [practices, setPractices] = useState<any[] | null>(null)
    const [title, setTitle] = useState<string>('')
    const [university, setUniversity] = useState<string>('')
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<Cords>(towns[0].cords)
    const [isMyField, setIsMyField] = useState<boolean>(false)

    const centum = new Centum()

    const getPracticesM = gql`
        mutation getPractices($username: String!) {
            getPractices(username: $username) {
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

    const [getPractices] = useMutation(getPracticesM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getPractices)
            setPractices(data.getPractices)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getPractices({
                variables: {
                    username: context.username
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (region !== '') {
            let result = towns.find(el => centum.search(el.title, region, SEARCH_PERCENT)) 
    
            if (result !== undefined) {
                setRegion(result.title)
                setCords(result.cords)
            }           
        }
    }, [region])

    useMemo(() => {
        if (university !== '') {
            let result = universities.find(el => centum.search(el, university, 75))

            if (result !== undefined) {
                setUniversity(result)
            }
        }
    }, [university])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 17})
    }, [cords])

    useMemo(() => {
        if (practices !== null) {
            let result = practices.filter(el => el.university === university)

            if (title !== '') {
                result = result.filter(el => centum.search(el.title, title, SEARCH_PERCENT))
            }

            if (isMyField) {
                result = result.filter(el => el.category === context.field)
            } else {
                result = result.filter(el => el.category !== context.field)
            }

            setFiltered(result)
        }
    }, [practices, title, university, isMyField])

    return (
        <>          
            <h2>Поиск IT-практики</h2>
            <div className='items small'>
                <div className='item'>
                    <h4 className='pale'>Наименование</h4>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Название практики' type='text' />
                </div>

                <div className='item'>
                    <h4 className='pale'>Местоположение</h4>
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Название города' type='text' />
                </div>
            </div>         
            <h4 className='pale'>Что за университет?</h4>
            <textarea value={university} onChange={e => setUniversity(e.target.value)} placeholder='Высшее учебное заведение' />

            <button onClick={() => setIsMyField(!isMyField)} className='light-btn'>{isMyField ? 'Моя' : 'Иная'} специализация</button>
 
            <DataPagination initialItems={filtered} setItems={setFiltered} />

            {practices !== null &&
                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                    <Marker latitude={cords.lat} longitude={cords.long}>
                        <MapPicker type='picker' />
                    </Marker>
                    {filtered.map(el => 
                        <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                            <NavigatorWrapper id='' isRedirect={false} url={`/practice/${el.shortid}`}>
                                {el.title}
                            </NavigatorWrapper>
                        </Marker>
                    )}
                </ReactMapGL>  
            }

            {practices === null && <Loading loadingLabel='практик' />}
        </>
    )
}

export default Practices