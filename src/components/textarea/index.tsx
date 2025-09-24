import styles from "./styles.module.css"
import { HTMLProps } from "react"

export default function TextArea({...props} : HTMLProps<HTMLTextAreaElement>){
    return(
        <textarea className={styles.textarea} {...props}></textarea>
    )
}