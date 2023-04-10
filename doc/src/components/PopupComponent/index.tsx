import { PropsWithChildren } from 'react';
import './index.less';

export type PopupComponentProps = {
} & React.HTMLAttributes<HTMLDivElement>

export default function PopupComponent({ children, ...props }: PropsWithChildren<PopupComponentProps>): JSX.Element {

  return (
    <div {...props} className={`popupComponent ${props.className}`}>
      <div className="pop-content">{children}</div>
      <div className="pop-arrow">
        <span className="pop-arrow-content" />
      </div>
    </div>
  )
}
