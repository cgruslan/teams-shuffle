(function () {
  'use strict';

  function shuffleList(list) {
    const newList = [...list];
    let i = newList.length;
    while (i > 1) {
      i -= 1;
      const j = Math.floor(Math.random() * i);
      [newList[j], newList[i]] = [newList[i], newList[j]];
    }
    return newList;
  }

  function curry(fn) {
    return function (...args) {
      if (args.length < fn.length) {
        return function (...moreArgs) {
          return fn(...args, ...moreArgs);
        };
      }
      return fn(...args);
    }
  }

  function compose(...fns) {
    return function (arg) {
      return fns.reduceRight((acc, fn) => fn(acc), arg);
    };
  }

  const split = curry((sep, s) => s.split(sep));
  const map = curry((fn, l) => l.map(fn));
  const filter = curry((fn, l) => l.filter(fn));
  const trim = s => s.trim();

  const app = Stimulus.Application.start();

  app.register('shuffler', class extends Stimulus.Controller {
    static targets = ['form', 'result', 'tbody'];

    handleSubmit(event) {
      event.preventDefault();
      const {
        gameMode: gameModeEl,
        keepFirst: keepFirstEl,
        players: playersEl,
      } = this.formTarget;

      const { teamA, teamB } = this.getTeams(
        compose(
          filter(Boolean),
          map(trim),
          split('\n'),
        )(playersEl.value),
        {
          gameMode: gameModeEl.value,
          keepFirst: keepFirstEl.checked,
        },
      );

      teamA.length && this.populateTable(teamA, teamB).toggle();
    }

    getMaxCount(mode) {
      const n = { 'just3': 3, 'just5': 5, '3vs3': 6, '5vs5': 10 };
      return n[mode] || 0;
    }

    getTeams(list, options = {}) {
      const maxCount = this.getMaxCount(options.gameMode);
      const players = [
        ...(options.keepFirst ? list.splice(0, 1) : []),
        ...shuffleList(list),
      ].slice(0, maxCount);
  
      if (maxCount <= 5) {
        return { teamA: players, teamB: [] };
      }
  
      return {
        teamA: players.slice(0, maxCount / 2),
        teamB: players.slice(maxCount / 2),
      };
    }

    populateTable(teamA, teamB) {
      this.tbodyTarget.innerHTML = teamA.reduce((acc, _, i) => {
        return ([
          ...acc,
          `<tr>
            <td>${teamA[i] || '-'}</td>
            <td>${teamB[i] || '-'}</td>
          </tr>`,
        ]);
      }, []).join('');
      return this;
    }

    toggle() {
      [this.formTarget, this.resultTarget]
        .forEach(el => el.hidden = !el.hidden);
    }
  });
}());
