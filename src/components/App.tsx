import * as React from 'react';
import "./../assets/scss/App.scss";

// Components
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// libs
import axios from 'axios';
import * as moment from 'moment';

class App extends React.Component<any, any> {

  constructor(props:any) {
    super(props as any);
    this.state = {
        value: '',
        profitValue: '',
        startDate: moment(),
        maxDate: moment(),
        submitDisabled: true

      };
    // this.handleCalendarChange = this.handleCalendarChange.bind(this);
    // this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
  };


  public handleCalendarChange = (date: any) => {
    this.setState({
      startDate: date
    });
  };

  public handleInputChange = (event: any) => {
    
    if(!/^[0-9]*[.,]?[0-9]+/.test(event.target.value) && event.target.value !== ''){
      this.setState({
        submitDisabled: true
      });
      return;
     }

    const submitVal = event.target.value === '';
    this.setState({
       submitDisabled: submitVal,
       value: event.target.value
    });
  };


  public getCurency(date:any, cur: string){
    const accessKey = '79106a35141d078697aa13d21cf49f34';
    return axios.get(`http://data.fixer.io/api/${date}?access_key=${accessKey}&symbols=${cur}`)
  };

  public handleSubmit = (event: any) => {
    event.preventDefault();

    if(!this.state.value){ 
      return;
    }

    const spred = 0.5;
    const curentDate = moment().format('YYYY-MM-DD');
    const estimateDate = this.state.startDate.format('YYYY-MM-DD');

    Promise.all([this.getCurency(curentDate,'USD'),this.getCurency(curentDate,'RUB'),this.getCurency(estimateDate,'USD'), this.getCurency(estimateDate,'RUB')])
      .then((values) => {
        const curentCurency = values[1].data.rates.RUB/values[0].data.rates.USD;
        const estimateCurency = values[3].data.rates.RUB/values[2].data.rates.USD

        // for testing
        console.log(curentDate);
        //sell -spred
        console.log((curentCurency - spred * curentCurency / 100) * this.state.value);
        console.log(estimateDate);
        //buy +spred
        console.log((estimateCurency + spred * estimateCurency / 100) * this.state.value);

        const profit = (curentCurency - spred * curentCurency / 100) * this.state.value - (estimateCurency + spred * estimateCurency / 100) * this.state.value;
        this.setState({
            profitValue: profit.toFixed(2)
          });
      }).catch((error) => {
          console.log(error);
          throw error;
      });
  };


  public render() {
    return (
      <div className="App">
        <form onSubmit={this.handleSubmit} className='recalculate-form'>
          <label className='recalculate-form__input-label'>
            Date:
             <DatePicker selected={this.state.startDate} onChange={this.handleCalendarChange} maxDate={this.state.maxDate}/>
          </label>
          <label className='recalculate-form__input-label'>
            Amount(USD):
            <input type="text" value={this.state.value} onChange={this.handleInputChange} className='recalculate-form__input input_acitve'/>
          </label>
          <label className='recalculate-form__input-label'>
            Profit/Loss(RUB):
            <input type="text" value={this.state.profitValue} disabled={true} className='recalculate-form__input input_disabled'/>
          </label>
          <label className='recalculate-form__input-label'>
          <input type="submit" value="Recalculate" className = {'recalculate-form__submit-button submit' + (this.state.submitDisabled ? ' submit_disabled' : '') }/>
          </label>
        </form>
      </div>
    );
  }
}

export default App;