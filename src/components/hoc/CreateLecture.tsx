import React, {useState, useMemo, useContext} from 'react'
import {useMutation, gql} from '@apollo/react-hooks'
import {LECTURES_TYPES, CRITERIONS, COURSE_LIMIT} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import universities from '../../env/universities.json'
import {Context} from '../../context/WebProvider'
import QuantityLabel from '../UI&UX/QuantityLabel'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType} from '../../types/types'

const CreateLecture: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [idx, setIdx] = useState<number>(0)
    const [course, setCourse] = useState<number>(1)
    const [state, setState] = useState({
        title: '', 
        category: LECTURES_TYPES[0], 
        university: '', 
        subject: '', 
        criterion: CRITERIONS[0], 
        rating: 50
    })

    const centum = new Centum()

    const {title, category, university, subject, criterion, rating} = state

    const createLectureM = gql`
        mutation createLecture($username: String!, $id: String!, $title: String!, $category: String!, $university: String!, $subject: String!, $course: Float!, $criterion: String!, $rating: Float!) {
            createLecture(username: $username, id: $id, title: $title, category: $category, university: $university, subject: $subject, course: $course, criterion: $criterion, rating: $rating)
        }
    `

    const [createLecture] = useMutation(createLectureM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createLecture)
            window.location.reload()
        }
    })

    useMemo(() => {
        if (university !== '') {
            let result = universities.find(el => centum.search(el, university, 75))

            if (result !== undefined) {
                setState({...state, university: result})
            }
        }
    }, [university])

    const onCreate = () => {
        createLecture({
            variables: {
                username: context.username, id: params.id, title, category, university, subject, course, criterion, rating
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Создайте лекцию' num={idx} setNum={setIdx} items={[
                    <>
                        <h3 className='pale'>Название</h3>
                        <textarea value={title} onChange={e => setState({...state, title: e.target.value})} placeholder='Название лекции' />
                    
                        <h3 className='pale'>Дисциплина</h3>
                        <input value={subject} onChange={e => setState({...state, subject: e.target.value})} placeholder='Название предмета' type='text' />  
                       
                        <h3 className='pale'>Тема</h3>
                        <div className='items small'>
                            {LECTURES_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                    </>,
                    <>
                        <h3 className='pale'>Университет и курс</h3>
                        <textarea value={university} onChange={e => setState({...state, university: e.target.value})} placeholder='Название вуза' />
                        <QuantityLabel num={course} setNum={setCourse} part={1} min={1} max={COURSE_LIMIT} label={`Текущий курс: ${course}`} />   
                    </>,
                    <>
                        <h3 className='pale'>Оценивание лектора</h3>
                        <select value={criterion} onChange={e => setState({...state, criterion: e.target.value})}>
                            {CRITERIONS.map(el => <option value={el}>{el}</option>)}
                        </select>
                        <h3 className='pale'>Рейтинг: <b>{rating}%</b></h3>
                        <input value={rating} onChange={e => setState({...state, rating: parseInt(e.target.value)})} type='range' step={1} />
                    </>
                ]} 
            />

            <button onClick={onCreate}>Создать</button>
        </div>
    )
}

export default CreateLecture