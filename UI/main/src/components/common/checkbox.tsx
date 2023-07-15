import { Component } from "react";

interface CheckboxProps {
    title: string;
    isChecked: () => boolean;
    onValueToggle: (newVal: boolean) => void;
}

export class Checkbox extends Component<CheckboxProps, {}> {
    constructor(props: CheckboxProps) {
        super(props);
        this.state = {}
    }
    render() {
        const { title, onValueToggle } = this.props;
        const isChecked = this.props.isChecked();
        return (
            <>
                <div className="field__MBOM9 field__UuCZq" onClick={() => {
                    onValueToggle(!isChecked);
                }}>
                    <div className="label__DGc7_ label__ZLbNH">
                        {title}
                    </div>
                    <div className={`toggle__ccalN item-mouse-states__FmiyB toggle__th_34 ${isChecked ? "checked" : "unchecked"}`} >
                        <div className={`checkmark__NXVuH ${isChecked ? "checked" : ""}`} ></div>
                    </div>
                </div>
            </>
        );
    }
}

interface CheckboxTitlelessProps {
    isChecked: () => boolean;
    onValueToggle: (newVal: boolean) => void;
}

export class CheckboxTitleless extends Component<CheckboxTitlelessProps, { checked: () => boolean }> {
    constructor(props: CheckboxProps) {
        super(props);
        this.state = {
            checked: props.isChecked
        }
    }
    render() {
        const { onValueToggle } = this.props;
        const isChecked = this.state.checked();
        return (<><div className={`toggle__ccalN item-mouse-states__FmiyB toggle__th_34 ${isChecked ? "checked" : "unchecked"}`} onClick={() => onValueToggle(!isChecked)}>
            <div className={`checkmark__NXVuH ${isChecked ? "checked" : ""}`} ></div>
        </div>
        </>);
    }
}