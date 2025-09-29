import { HTMLProps } from "react"

export default function TextArea({...props} : HTMLProps<HTMLTextAreaElement>){
    return(
        <textarea style={{resize: "none", outline: "none"}}  {...props}></textarea>
    )
}