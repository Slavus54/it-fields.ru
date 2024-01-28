import React from 'react'
import {styled} from 'styled-components'
import {LIKE_GRADES, GRADE_MAINCOLOR} from '../../env/env'
import {LikeGradeProps, LikeBoxProps} from '../../types/types'

const BoxComponent = styled.div<LikeBoxProps>`
    display: block;
    width: 1rem;
    height: 1rem;
    background-color: ${props => props.$color};
    border: 1px solid ${props => props.$count <= props.$likes ? GRADE_MAINCOLOR : props.$color};
    border-radius: 0.2rem;
`

const ProjectLikesGrades: React.FC<LikeGradeProps> = ({likes}) => {
    return (
        <div className='items little'>
            {LIKE_GRADES.map(el => <BoxComponent $color={el.color} $likes={likes} $count={el.number} />)}
        </div>
    )
}

export default ProjectLikesGrades