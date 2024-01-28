import {useState} from 'react';
import {useMutation, gql} from '@apollo/react-hooks';
import {LINK_TYPES, FIELDS, COURSE_LIMIT} from '../../env/env'
import QuantityLabel from '../UI&UX/QuantityLabel'
import {AccountPageComponentProps} from '../../types/types'

const StudyProfileInfo = ({profile, context}: AccountPageComponentProps) => {
    const [course, setCourse] = useState<number>(profile.course)
    const [state, setState] = useState<any>({
        link_type: profile.link_type, 
        link_content: profile.link_content, 
        field: FIELDS[0]
    })

    const {link_type, link_content, field} = state

    const updateProfileStudyInfoM = gql`
        mutation updateProfileStudyInfo($account_id: String!, $link_type: String!, $link_content: String!, $field: String!, $course: Float!) {
            updateProfileStudyInfo(account_id: $account_id, link_type: $link_type, link_content: $link_content, field: $field, course: $course)
        }
    `

    const [updateProfileStudyInfo] = useMutation(updateProfileStudyInfoM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.updateProfileStudyInfo)
            window.location.reload()
        }
    })

    const onUpdate = () => {
        updateProfileStudyInfo({
            variables: {
                account_id: context.account_id, link_type, link_content, field, course
            }
        })
    }
 
    return (
        <>
            <h2>Дополнительная информация</h2>
            <h4 className='pale'>Nickname, ID или Tag</h4>
            <input value={link_content} onChange={e => setState({...state, link_content: e.target.value})} placeholder='Ваш идентификатор' type='text' />
            <h4 className='pale'>Вид связи</h4>
            <div className='items small'>
                {LINK_TYPES.map(el => <div onClick={() => setState({...state, link_type: el})} className={el === link_type ? 'item label active' : 'item label'}>{el}</div>)}
            </div>
            
            <h4 className='pale'>Сфера деятельности и курс обучения</h4>
            <select value={field} onChange={e => setState({...state, field: e.target.value})}>
                {FIELDS.map(el => <option value={el}>{el}</option>)}
            </select>
            <QuantityLabel num={course} setNum={setCourse} part={1} min={1} max={COURSE_LIMIT} label={`Текущий курс: ${course}`} />
 
            <button onClick={onUpdate}>Обновить</button>
        </> 
    )
}

export default StudyProfileInfo