import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {POSITIONS, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import MapPicker from '../UI&UX/MapPicker'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'
import {TownType, Cords} from '../../types/types'

const Vacancies: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [filtered, setFiltered] = useState<any[]>([])
    const [vacancies, setVacancies] = useState<any[] | null>(null)
    const [title, setTitle] = useState<string>('')
    const [position, setPosition] = useState<string>(POSITIONS[0])
    const [region, setRegion] = useState<string>(towns[0].title)
    const [cords, setCords] = useState<Cords>(towns[0].cords)
    const [isMyField, setIsMyField] = useState<boolean>(false)

    const centum = new Centum()

    const getVacanciesM = gql`
        mutation getVacancies($username: String!) {
            getVacancies(username: $username) {
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

    const [getVacancies] = useMutation(getVacanciesM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getVacancies)
            setVacancies(data.getVacancies)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getVacancies({
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
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 17})
    }, [cords])

    useMemo(() => {
        if (vacancies !== null) {
            let result = vacancies.filter(el => el.position === position && el.region === region)

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
    }, [vacancies, title, position, region, isMyField])

    return (
        <>          
            <h2>Найдите лучшую вакансию</h2>
            <div className='items small'>
                <div className='item'>
                    <h4 className='pale'>Наименование</h4>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Название вакансии' type='text' />
                </div>

                <div className='item'>
                    <h4 className='pale'>Местоположение</h4>
                    <input value={region} onChange={e => setRegion(e.target.value)} placeholder='Название города' type='text' />
                </div>
            </div>         
       
            <h4 className='pale'>Должность</h4>
            <div className='items small'>
                {POSITIONS.map(el => <div onClick={() => setPosition(el)} className={el === position ? 'item label active' : 'item label'}>{el}</div>)}
            </div>

            <button onClick={() => setIsMyField(!isMyField)} className='light-btn'>{isMyField ? 'Моя' : 'Иная'} специализация</button>
 
            <DataPagination initialItems={filtered} setItems={setFiltered} />

            {vacancies !== null &&
                <ReactMapGL onClick={e => setCords(centum.mapboxCords(e))} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                    <Marker latitude={cords.lat} longitude={cords.long}>
                        <MapPicker type='picker' />
                    </Marker>
                    {filtered.map(el => 
                        <Marker latitude={el.cords.lat} longitude={el.cords.long}>
                            <NavigatorWrapper id='' isRedirect={false} url={`/vacancy/${el.shortid}`}>
                                {centum.shorter(el.title)}
                            </NavigatorWrapper>
                        </Marker>
                    )}
                </ReactMapGL>  
            }

            {vacancies === null && <Loading loadingLabel='вакансий' />}
        </>
    )
}

export default Vacancies