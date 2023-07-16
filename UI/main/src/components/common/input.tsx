import { CSSProperties, Component, KeyboardEvent } from "react";

interface InputProps {
    title: string;
    getValue: () => string;
    onValueChanged: (newVal: string) => string;
    isValid?: (newVal: string) => boolean
    onTab?: (newVal: string, shiftDown: boolean) => string
    cssCustomOverrides?: {
        backgroundColor?: (value: string) => string,
        color?: (value: string) => string,
    }
    maxLenght?: number
}

export class Input extends Component<InputProps, { value: string, refValue: string }> {
    constructor(props: InputProps) {
        super(props);
        this.state = {
            value: this.props.getValue(),
            refValue: this.props.getValue()
        }

    }
    checkInvalidClasses() {
        if (this.props.isValid && !this.props.isValid(this.state.value)) {
            return "input_invalidValue"
        }
    }


    render() {
        const { title, onValueChanged } = this.props;
        const currentOuterValue = this.props.getValue();
        let targetValue = this.state.value;
        if (currentOuterValue != this.state.refValue) {
            this.setState({
                value: targetValue = this.props.getValue(),
                refValue: this.props.getValue()
            })
        }
        const overrideStyle: CSSProperties = { width: "50%" };
        if (this.props.cssCustomOverrides && (!this.props.isValid || this.props.isValid(this.state.value))) {
            overrideStyle.backgroundColor = this.props.cssCustomOverrides.backgroundColor?.(this.state.value);
            overrideStyle.color = this.props.cssCustomOverrides.color?.(this.state.value);
        }
        return (
            <>
                <div className="field__MBOM9 field__UuCZq">
                    <div className="label__DGc7_ label__ZLbNH">
                        {title}
                    </div>
                    <input style={overrideStyle}
                        value={targetValue}
                        className={"value-field__yJiUY value__PW_tv " + this.checkInvalidClasses()}
                        onChange={x => this.setState({ value: x.target.value })}
                        onKeyDown={(x) => this.onKeyDown(x)}
                        onBlur={() => this.setState({ value: onValueChanged(this.state.value) })}
                        maxLength={this.props.maxLenght}
                    />
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
            if (!this.props.isValid || this.props.isValid(x.currentTarget.value)) {
                x.currentTarget.blur();
            }
        } else if (x.key == "Tab") {
            if (this.props.onTab) {
                this.setState({ value: this.props.onTab(this.state.value, x.shiftKey) })
            }
        }
    }
}