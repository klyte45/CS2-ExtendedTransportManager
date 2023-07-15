import { Component, KeyboardEvent } from "react";

interface InputProps {
    title: string;
    getValue: () => string;
    onValueChanged: (newVal: string) => string;
}

export class Input extends Component<InputProps, { value: string }> {
    constructor(props: InputProps) {
        super(props);
        this.state = { value: this.props.getValue() }
    }
    render() {
        const { title, onValueChanged } = this.props;
        return (
            <>
                <div className="field__MBOM9 field__UuCZq">
                    <div className="label__DGc7_ label__ZLbNH">
                        {title}
                    </div>
                    <input style={{ width: "50%" }} value={this.state.value} className="value-field__yJiUY value__PW_tv" onChange={x => this.setState({ value: x.target.value })}
                        onKeyDown={(x) => this.onKeyDown(x)}
                        onBlur={() => this.setState({ value: onValueChanged(this.state.value) })} />
                </div>
            </>
        );
    }
    onKeyDown(x: KeyboardEvent<HTMLInputElement>): void {
        if (x.key == "Escape") {
            const currentTarget = x.currentTarget;
            this.setState({ value: this.props.getValue() }, () => {
                currentTarget.value = this.state.value
                currentTarget.blur();
            })
        } else if (x.key == "Enter") {
            x.currentTarget.blur();
        }
    }
}