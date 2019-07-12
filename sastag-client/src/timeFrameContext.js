import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';

class TimeFrameContext extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            timeFrame: "all",
        };
    }

    componentDidUpdate(prevProps, prevState) {
    	if (this.state.timeFrame !== prevState.timeFrame) {
    		console.log('Time frame changed to ' + this.state.timeFrame);
    	}
    }

	render () {
		return (
			<Form.Control defaultValue="all" as="select" onChange={(e) => this.updateCharts(e)} >
                <option value="1 week">1 Week</option>
                <option value="2 weeks">2 Weeks</option>
                <option value="3 weeks">3 Weeks</option>
                <option value="1 month">1 Month</option>
                <option value="2 months">2 Months</option>
                <option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option>
                <option value="all">All Time</option>
            </Form.Control>
		);
	}

	updateCharts(event) {
		this.setState({
			timeFrame: event.target.value,
		});
	}
}

export default TimeFrameContext;