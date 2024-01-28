import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {LECTURES_TYPES, SEARCH_PERCENT} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {Context} from '../../context/WebProvider'
import NavigatorWrapper from '../router/NavigatorWrapper'
import DataPagination from '../UI&UX/DataPagination'
import Loading from '../UI&UX/Loading'

const Lectures: React.FC = () => {
    const {context} = useContext<any>(Context)
    const [filtered, setFiltered] = useState<any[]>([])
    const [lectures, setLectures] = useState<any[] | null>(null)
    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>(LECTURES_TYPES[0])
    const [isMyCourse, setIsMyCourse] = useState<boolean>(false)

    const centum = new Centum()

    const getLecturesM = gql`
        mutation getLectures($username: String!) {
            getLectures(username: $username) {
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

    const [getLectures] = useMutation(getLecturesM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.getLectures)
            setLectures(data.getLectures)
        }
    })

    useMemo(() => {
        if (context.account_id !== '') {
            getLectures({
                variables: {
                    username: context.username
                }
            })
        }
    }, [context.account_id])

    useMemo(() => {
        if (lectures !== null) {
            let result = lectures.filter(el => el.category === category)

            if (title !== '') {
                result = result.filter(el => centum.search(el.title, title, SEARCH_PERCENT))
            }

            if (isMyCourse) {
                result = result.filter(el => el.course === context.course)
            } else {
                result = result.filter(el => el.course !== context.course)
            }

            setFiltered(result)
        }
    }, [lectures, title, category, isMyCourse])

    return (
        <>          
            <h2>Поиск лекций</h2>
            <textarea value={title} onChange={e => setTitle(e.target.value)} placeholder='Название лекции' />
            
            <h4 className='pale'>Тема</h4>
            <div className='items small'>
                {LECTURES_TYPES.map(el => <div onClick={() => setCategory(el)} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
            </div>

            <button onClick={() => setIsMyCourse(!isMyCourse)} className='light-btn'>{isMyCourse ? 'Мой' : 'Иной'} курс</button>
 
            <DataPagination initialItems={filtered} setItems={setFiltered} />

            {lectures !== null &&
                <div className='items half'>
                    {filtered.map(el => 
                        <NavigatorWrapper id='' isRedirect={false} url={`/lecture/${el.shortid}`}>
                            <div className='item card'>
                                {centum.shorter(el.title)}
                            </div> 
                        </NavigatorWrapper>
                    )}
                </div>
            }
            {lectures === null && <Loading loadingLabel='лекций' />}
        </>
    )
}

export default Lectures